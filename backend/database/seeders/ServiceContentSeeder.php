<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

/**
 * The marketing content that makes each service page worth indexing: the
 * trade name people actually search for, the problems customers actually
 * describe, and questions specific to that service.
 *
 * Only runs against categories ServiceCategorySeeder has created, and never
 * overwrites text an admin has since edited in the dashboard.
 */
class ServiceContentSeeder extends Seeder
{
    /**
     * slug => [trade_slug, trade_name, common problems, faqs]
     */
    private function content(): array
    {
        return [
            'plumbing' => ['plumber', 'Plumber', [
                'Leaking tap, mixer or shower head',
                'Kitchen or bathroom drain blocked or draining slowly',
                'Water under the sink cabinet',
                'Low water pressure in one or more taps',
                'Running toilet or a flush that will not stop',
            ], [
                ['How much does a plumber cost in Pakistan?', 'Small jobs like a tap washer or a blocked drain usually cost Rs 1,500 to Rs 3,000 including the visit. Pipe replacement and bathroom fittings are quoted after inspection, because the price depends on what is behind the wall.'],
                ['Should I turn off the water before the plumber arrives?', 'If water is actively leaking, yes. Close the valve for that fixture or the main supply, and switch off the water motor so the tank is not drained onto the floor.'],
            ]],
            'electrical' => ['electrician', 'Electrician', [
                'Breaker trips when several appliances run together',
                'Socket or switch sparking, buzzing or warm to the touch',
                'Lights flickering across the house',
                'No power in one room or one circuit',
                'New light fittings, fans or sockets to install',
            ], [
                ['Is a warm or buzzing socket dangerous?', 'Yes. Stop using it, switch off that circuit at the breaker if you can do so safely, and book an electrician. Heat at a socket usually means a loose or overloaded connection, which is a fire risk.'],
                ['Why does my breaker keep tripping?', 'Usually the circuit is carrying more load than it was wired for, or an appliance has a fault. An electrician can measure the load and tell you which it is. Never replace a breaker with a larger one to stop the tripping.'],
            ]],
            'ac-hvac' => ['ac-repair', 'AC Technician', [
                'AC runs but does not cool',
                'Water dripping from the indoor unit',
                'Outdoor unit making a loud noise or not starting',
                'AC trips the breaker when it starts',
                'Bad smell when the AC is switched on',
            ], [
                ['How often should an AC be serviced in Pakistan?', 'Twice a year: once before summer and once after. Dust and heat here clog filters and coils far faster than the manufacturer schedule assumes, and a dirty coil is the most common reason an AC stops cooling.'],
                ['My AC is not cooling. Does it need gas?', 'Not necessarily. A dirty filter or blocked outdoor coil causes the same symptom and costs far less to fix. Gas only needs topping up if there is a leak, and a good technician will find the leak rather than just refilling.'],
            ]],
            'refrigerator-repair' => ['fridge-repair', 'Refrigerator Technician', [
                'Fridge not cooling but the light is on',
                'Freezer working but the fridge section is warm',
                'Ice building up on the back wall',
                'Water leaking inside or under the fridge',
                'Compressor clicking on and off',
            ], [
                ['Is it worth repairing an old fridge?', 'If the compressor is fine, usually yes: thermostats, fans and door seals are inexpensive. If the compressor has failed on a fridge older than ten years, a replacement is often the better value.'],
            ]],
            'washing-machine-repair' => ['washing-machine-repair', 'Washing Machine Technician', [
                'Drum does not spin',
                'Loud banging during the spin cycle',
                'Water not draining at the end of a wash',
                'Machine not filling with water',
                'Leaking from the door or underneath',
            ], [
                ['Why is my washing machine so loud when it spins?', 'Most often the load is unbalanced or the machine is not level. If that is not it, worn drum bearings or broken suspension springs are likely, and those need a technician before they damage the drum.'],
            ]],
            'water-motor' => ['water-pump-repair', 'Water Pump Technician', [
                'Motor runs but no water reaches the tank',
                'Motor hums but does not start',
                'Low pressure from the pressure pump',
                'Motor tripping or overheating',
            ], []],
            'water-tank' => ['water-tank-cleaning', 'Water Tank Cleaner', [
                'Dirty or discoloured tap water',
                'Tank has not been cleaned in over six months',
                'Tank leaking or overflowing',
            ], [
                ['How often should a water tank be cleaned?', 'Every six months. Sediment and algae build up quickly, especially in overhead tanks exposed to heat.'],
            ]],
            'solar-system' => ['solar-technician', 'Solar Technician', [
                'Solar output lower than it used to be',
                'Inverter showing an error code',
                'Batteries not holding charge overnight',
                'Panels dusty and in need of cleaning',
            ], [
                ['How often should solar panels be cleaned?', 'In most Pakistani cities, monthly. Dust can cut output noticeably within a few weeks, and more after a dust storm.'],
            ]],
            'ups-inverter' => ['ups-repair', 'UPS Technician', [
                'Backup time much shorter than before',
                'UPS beeping continuously',
                'UPS not switching over during load shedding',
                'Battery swelling or leaking',
            ], [
                ['A UPS battery is swollen. What should I do?', 'Switch the UPS off and unplug it. A swollen battery is damaged and should not be charged. Keep it ventilated and book a technician to replace it.'],
            ]],
            'generator' => ['generator-repair', 'Generator Technician', [
                'Generator will not start',
                'Generator starts but stalls under load',
                'Auto-start panel not switching over',
                'Smoke or a fuel smell while running',
            ], []],
            'carpentry' => ['carpenter', 'Carpenter', [
                'Door not closing or sticking after the monsoon',
                'Broken hinges or drawer runners',
                'Wardrobe or kitchen cabinet repairs',
                'Custom shelving or cupboards',
            ], []],
            'painting' => ['painter', 'Painter', [
                'Peeling or flaking paint from damp walls',
                'Repainting a room or a whole house',
                'Exterior walls faded by the sun',
                'Stains that show through old paint',
            ], [
                ['Can a painter fix peeling paint caused by damp?', 'Only temporarily, unless the damp is fixed first. Ask for the source of the moisture to be checked; painting over it will peel again within a season.'],
            ]],
            'pest-control' => ['pest-control', 'Pest Control Specialist', [
                'Cockroaches in the kitchen',
                'Termites in doors, frames or furniture',
                'Mosquitoes around the house',
                'Rats or mice',
                'Bed bugs',
            ], [
                ['Is fumigation safe for children and pets?', 'Ask the professional which chemicals they use and how long to keep the area empty. Most treatments need a few hours of ventilation before children or pets return.'],
            ]],
            'cleaning' => ['home-cleaning', 'Home Cleaner', [
                'Regular cleaning for a home or office',
                'Cleaning before or after guests',
                'Move-in or move-out cleaning',
            ], []],
            'deep-cleaning' => ['deep-cleaning', 'Deep Cleaning Service', [
                'Kitchen grease on cabinets and tiles',
                'Bathroom limescale and stains',
                'Full-house clean before moving in',
            ], []],
            'door-locks' => ['locksmith', 'Locksmith', [
                'Locked out of the house',
                'Key broken inside the lock',
                'Lock replacement after losing keys',
                'Digital lock installation',
            ], []],
            'cctv' => ['cctv-installation', 'CCTV Installer', [
                'New camera installation',
                'Cameras not recording or showing no signal',
                'Remote viewing on a phone not working',
            ], []],
            'furniture-repair' => ['furniture-repair', 'Furniture Repair Specialist', [
                'Loose or wobbly chairs and tables',
                'Sofa upholstery worn or torn',
                'Wood polish and scratch repair',
            ], []],
        ];
    }

    public function run(): void
    {
        $updated = 0;

        foreach ($this->content() as $slug => [$tradeSlug, $tradeName, $problems, $faqs]) {
            $category = ServiceCategory::where('slug', $slug)->first();

            if (! $category) {
                continue;
            }

            $category->forceFill([
                'trade_slug' => $category->trade_slug ?? $tradeSlug,
                'trade_name' => $category->trade_name ?? $tradeName,
                'common_problems' => $category->common_problems ?? $problems,
            ])->save();

            foreach ($faqs as $index => [$question, $answer]) {
                Faq::updateOrCreate(
                    ['question' => $question],
                    [
                        'service_category_id' => $category->id,
                        'answer' => $answer,
                        'group' => 'service',
                        'sort_order' => $index,
                        'is_active' => true,
                    ]
                );
            }

            $updated++;
        }

        $this->command?->info("Added trade names and service content to {$updated} categories.");
    }
}
