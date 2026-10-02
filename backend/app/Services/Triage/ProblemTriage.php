<?php

declare(strict_types=1);

namespace App\Services\Triage;

use App\Enums\SafetyLevel;
use App\Models\ServiceCategory;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * First-pass triage of a problem description, without calling an AI model.
 *
 * Two jobs, in strict order:
 *
 *  1. Spot emergencies. A description mentioning a gas smell, sparking,
 *     exposed wiring, a collapsing ceiling or flooding is an emergency before
 *     anything else happens to it. This is deliberately keyword-based and
 *     over-eager: a false alarm costs a customer a moment, a missed gas leak
 *     costs far more.
 *  2. Suggest the service categories the problem most likely belongs to.
 *
 * The model-based diagnosis arriving in Phase 4 runs *after* this check, not
 * instead of it, so the emergency rule can never be talked out of by a prompt.
 *
 * Keywords include common Roman Urdu phrasings, because that is how a lot of
 * people in Pakistan type.
 */
class ProblemTriage
{
    /**
     * type => [title, keywords, steps, recommended category slug]
     */
    private const EMERGENCIES = [
        'gas_leak' => [
            'Possible gas leak',
            ['gas leak', 'gas smell', 'smell of gas', 'smells like gas', 'gas ki boo', 'gas ki bu', 'gas leak ho', 'cylinder leak', 'gas pipe leak'],
            [
                'Do not switch any light, fan or appliance on or off.',
                'Do not light a match, lighter or stove.',
                'If you can reach it without walking through the smell, close the gas valve at the meter or cylinder.',
                'Open doors and windows on your way out.',
                'Get everyone, including pets, out of the building.',
                'Call your gas company emergency line once you are outside.',
            ],
            'emergency-repair',
        ],
        'carbon_monoxide' => [
            'Possible carbon monoxide exposure',
            ['carbon monoxide', 'co alarm', 'headache from heater', 'dizzy near heater', 'gas heater dizzy', 'geyser fumes'],
            [
                'Switch off the heater or geyser only if the control is right beside you.',
                'Open windows and get everyone out into fresh air.',
                'If anyone feels dizzy, sick or confused, call 1122 immediately.',
                'Do not use the appliance again until a professional has inspected it.',
            ],
            'emergency-repair',
        ],
        'electrical_fire' => [
            'Electrical fire or sparking',
            ['sparking', 'sparks from', 'socket smoking', 'burning smell from socket', 'wire burning', 'electrical fire', 'smoke from switch', 'smoke from socket', 'board se dhuan', 'aag lag', 'spark aa'],
            [
                'If it is safe to reach, switch off the main breaker.',
                'Never use water on an electrical fire.',
                'If there are flames, leave the building and call 16 (fire brigade) or 1122.',
                'Do not touch the socket, switch or wire.',
            ],
            'electrical',
        ],
        'exposed_wiring' => [
            'Exposed or live wiring',
            ['exposed wire', 'naked wire', 'live wire', 'bare wire', 'high voltage', 'current lag', 'electric shock', 'got a shock', 'shock lag', 'wire hanging', 'nangi taar'],
            [
                'Keep everyone, especially children, away from the wire.',
                'Switch off the main breaker if you can reach it without touching anything wet.',
                'If someone has been shocked and is still touching the source, do not touch them; switch off the power first, then call 1122.',
                'Do not try to tape or move the wire yourself.',
            ],
            'electrical',
        ],
        'structural' => [
            'Possible structural damage',
            ['ceiling falling', 'ceiling collapse', 'roof collapse', 'roof caving', 'wall collapse', 'crack getting wider', 'crack is growing', 'beam cracked', 'chhat gir', 'deewar gir', 'building shaking'],
            [
                'Leave the affected room and keep everyone out.',
                'If cracks are spreading quickly or you hear cracking sounds, leave the building.',
                'Do not place heavy items on the affected floor or roof.',
                'Call 1122 if the structure looks unstable.',
            ],
            'construction',
        ],
        'flooding' => [
            'Major water leak or flooding',
            ['flooding', 'house flooded', 'water everywhere', 'pipe burst', 'burst pipe', 'water pouring', 'pani bhar gaya', 'pani hi pani'],
            [
                'Close the main water valve and switch off the water motor.',
                'If water is near sockets, appliances or the distribution board, switch off the main breaker, but only if you are not standing in water.',
                'Do not touch anything electrical while standing in water.',
                'Move valuables and electronics above the water line.',
            ],
            'plumbing',
        ],
        'fuel_leak' => [
            'Fuel leak',
            ['petrol leak', 'diesel leak', 'fuel leak', 'generator leaking fuel', 'smell of petrol', 'smell of diesel'],
            [
                'Switch the generator off and let it cool. Do not restart it.',
                'Keep flames, cigarettes and sparks well away.',
                'Ventilate the area.',
                'Do not try to repair the fuel line yourself.',
            ],
            'generator',
        ],
    ];

    /**
     * Co-occurrence rules. Exact phrases miss how people actually write --
     * "I can smell gas in the kitchen" contains no fixed phrase -- so an
     * emergency also fires when the description contains at least one word
     * from *every* group. Each group is a list of alternatives.
     *
     * type => list of rules; rule => list of groups; group => list of words
     */
    private const EMERGENCY_RULES = [
        'gas_leak' => [
            [['gas', 'cylinder', 'sui gas'], ['smell', 'smelling', 'leak', 'leaking', 'boo', 'bu', 'hiss', 'hissing', 'odour', 'odor']],
        ],
        'carbon_monoxide' => [
            [['heater', 'geyser', 'gas heater', 'angeethi'], ['dizzy', 'dizziness', 'fainted', 'unconscious', 'headache', 'nausea', 'vomiting', 'fumes']],
        ],
        'fuel_leak' => [
            [['petrol', 'diesel', 'fuel'], ['leak', 'leaking', 'spill', 'spilled', 'smell', 'smelling']],
        ],
        'electrical_fire' => [
            [['socket', 'switch', 'plug', 'wire', 'wiring', 'board', 'breaker', 'meter', 'extension'], ['smoke', 'smoking', 'spark', 'sparks', 'sparking', 'fire', 'flames', 'melting', 'melted', 'dhuan', 'aag']],
        ],
        'exposed_wiring' => [
            [['wire', 'wires', 'wiring', 'taar', 'cable'], ['exposed', 'naked', 'bare', 'live', 'hanging', 'nangi', 'cut', 'open']],
            [['shock', 'current'], ['got', 'gave', 'giving', 'lag', 'laga', 'lagta']],
        ],
        'structural' => [
            [['ceiling', 'roof', 'wall', 'beam', 'column', 'chhat', 'deewar'], ['collapse', 'collapsed', 'collapsing', 'falling', 'fell', 'caving', 'sagging', 'gir', 'girne']],
        ],
        'flooding' => [
            [['water', 'pani'], ['everywhere', 'flooding', 'flooded', 'pouring', 'gushing', 'bhar']],
        ],
    ];

    /**
     * category slug => keywords. Longer, more specific phrases score higher.
     */
    private const CATEGORY_KEYWORDS = [
        'ac-hvac' => ['ac', 'air conditioner', 'air conditioning', 'not cooling', 'split ac', 'inverter ac', 'ac gas', 'cooling', 'ac service', 'ac leaking'],
        'plumbing' => ['leak', 'leaking', 'tap', 'faucet', 'pipe', 'drain', 'blocked', 'sink', 'toilet', 'flush', 'commode', 'shower', 'nalka', 'water pressure', 'geyser', 'water heater'],
        'electrical' => ['breaker', 'tripping', 'trips', 'socket', 'switch', 'wiring', 'light', 'fan', 'bulb', 'electric', 'bijli', 'short circuit', 'voltage', 'db box'],
        'refrigerator-repair' => ['fridge', 'refrigerator', 'freezer', 'deep freezer'],
        'washing-machine-repair' => ['washing machine', 'spin', 'drum', 'dryer', 'washer'],
        'kitchen-appliances' => ['microwave', 'oven', 'stove', 'hob', 'dishwasher', 'chimney', 'hood'],
        'water-motor' => ['motor', 'water pump', 'pump', 'booster', 'suction'],
        'water-tank' => ['water tank', 'tank cleaning', 'overhead tank', 'tanki'],
        'solar-system' => ['solar', 'solar panel', 'net metering'],
        'ups-inverter' => ['ups', 'battery', 'load shedding', 'backup', 'inverter battery'],
        'generator' => ['generator', 'genset'],
        'carpentry' => ['door', 'wardrobe', 'cabinet', 'hinge', 'drawer', 'wood', 'cupboard'],
        'furniture-repair' => ['sofa', 'chair', 'table', 'bed frame', 'furniture', 'polish'],
        'painting' => ['paint', 'peeling', 'repaint', 'colour', 'color'],
        'wall-repair' => ['crack', 'wall', 'plaster', 'hole in wall'],
        'roof-repair' => ['roof', 'roof leak', 'ceiling leak', 'chhat'],
        'waterproofing' => ['damp', 'seepage', 'waterproof', 'moisture', 'seelan'],
        'pest-control' => ['cockroach', 'termite', 'deemak', 'rat', 'mice', 'mouse', 'mosquito', 'bed bug', 'bedbug', 'ants', 'pest', 'keeray'],
        'cleaning' => ['cleaning', 'clean', 'safai'],
        'deep-cleaning' => ['deep clean', 'deep cleaning', 'move in cleaning'],
        'door-locks' => ['lock', 'locked out', 'key', 'digital lock'],
        'cctv' => ['cctv', 'camera', 'dvr', 'nvr'],
        'internet-networking' => ['wifi', 'wi-fi', 'internet', 'router', 'network'],
        'bathroom-repair' => ['bathroom', 'washroom', 'tiles bathroom'],
        'tiles' => ['tile', 'tiles', 'grout'],
        'glass-work' => ['glass', 'mirror', 'window glass'],
        'gardening' => ['garden', 'lawn', 'plants', 'grass'],
    ];

    /**
     * @return array{
     *     is_emergency: bool,
     *     emergency: array{type:string,title:string,steps:list<string>,category_slug:string}|null,
     *     safety_level: string,
     *     matches: list<array{category: ServiceCategory, score: int, confidence: string, matched_terms: list<string>}>
     * }
     */
    public function triage(string $description): array
    {
        $text = $this->normalise($description);
        $emergency = $this->detectEmergency($text);
        $matches = $this->matchCategories($text);

        // An emergency's own category always leads, whatever else matched.
        if ($emergency !== null) {
            $matches = $matches->reject(fn (array $m) => $m['category']->slug === $emergency['category_slug']);

            if ($category = ServiceCategory::active()->where('slug', $emergency['category_slug'])->first()) {
                $matches->prepend([
                    'category' => $category,
                    'score' => 100,
                    'confidence' => 'high',
                    'matched_terms' => [],
                ]);
            }
        }

        return [
            'is_emergency' => $emergency !== null,
            'emergency' => $emergency,
            'safety_level' => $this->safetyLevel($emergency, $matches)->value,
            'matches' => $matches->take(3)->values()->all(),
        ];
    }

    private function detectEmergency(string $text): ?array
    {
        foreach (self::EMERGENCIES as $type => [$title, $keywords, $steps, $categorySlug]) {
            if ($this->matchesAnyPhrase($text, $keywords) || $this->matchesAnyRule($text, self::EMERGENCY_RULES[$type] ?? [])) {
                return [
                    'type' => $type,
                    'title' => $title,
                    'steps' => $steps,
                    'category_slug' => $categorySlug,
                ];
            }
        }

        return null;
    }

    private function matchesAnyPhrase(string $text, array $phrases): bool
    {
        foreach ($phrases as $phrase) {
            if ($this->contains($text, $phrase)) {
                return true;
            }
        }

        return false;
    }

    /** True when some rule has a hit in every one of its groups. */
    private function matchesAnyRule(string $text, array $rules): bool
    {
        foreach ($rules as $groups) {
            $allGroupsHit = true;

            foreach ($groups as $alternatives) {
                if (! $this->matchesAnyPhrase($text, $alternatives)) {
                    $allGroupsHit = false;
                    break;
                }
            }

            if ($allGroupsHit) {
                return true;
            }
        }

        return false;
    }

    /** @return Collection<int, array{category: ServiceCategory, score: int, confidence: string, matched_terms: list<string>}> */
    private function matchCategories(string $text): Collection
    {
        $scores = [];

        foreach (self::CATEGORY_KEYWORDS as $slug => $keywords) {
            foreach ($keywords as $keyword) {
                if ($this->contains($text, $keyword)) {
                    // Multi-word phrases are stronger evidence than one word.
                    $scores[$slug]['score'] = ($scores[$slug]['score'] ?? 0) + 10 * max(1, str_word_count($keyword));
                    $scores[$slug]['terms'][] = $keyword;
                }
            }
        }

        if ($scores === []) {
            return collect();
        }

        $categories = ServiceCategory::active()
            ->whereIn('slug', array_keys($scores))
            ->get()
            ->keyBy('slug');

        return collect($scores)
            ->filter(fn ($_, string $slug) => $categories->has($slug))
            ->map(fn (array $entry, string $slug) => [
                'category' => $categories[$slug],
                'score' => $entry['score'],
                'confidence' => match (true) {
                    $entry['score'] >= 30 => 'high',
                    $entry['score'] >= 20 => 'medium',
                    default => 'low',
                },
                'matched_terms' => array_values(array_unique($entry['terms'])),
            ])
            ->sortByDesc('score')
            ->values();
    }

    private function safetyLevel(?array $emergency, Collection $matches): SafetyLevel
    {
        if ($emergency !== null) {
            return SafetyLevel::Emergency;
        }

        $top = $matches->first()['category']->slug ?? null;

        // Anything involving mains electricity, fuel or structure is not a
        // do-it-yourself job, even when nothing sounds urgent.
        return match ($top) {
            'electrical', 'generator', 'solar-system', 'roof-repair', 'wall-repair' => SafetyLevel::High,
            null => SafetyLevel::Medium,
            default => SafetyLevel::Medium,
        };
    }

    private function normalise(string $text): string
    {
        return ' ' . Str::of($text)->lower()->replaceMatches('/[^a-z0-9\s\-]/u', ' ')->squish() . ' ';
    }

    /**
     * Whole-word match, so "ac" does not fire on "back" or "place". A plural
     * ending is allowed, so "cockroach" matches "cockroaches".
     */
    private function contains(string $text, string $keyword): bool
    {
        $needle = preg_quote(trim($this->normalise($keyword)), '/');

        return preg_match('/(?<![a-z0-9])' . $needle . '(?:e?s)?(?![a-z0-9])/', $text) === 1;
    }
}
