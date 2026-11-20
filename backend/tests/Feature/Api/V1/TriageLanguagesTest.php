<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * "Check my problem" understands English, Roman Urdu and Urdu script, forgives
 * small typos, and offers "Something else" when nothing fits.
 */
class TriageLanguagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    #[DataProvider('problems')]
    public function test_a_problem_in_any_language_finds_its_service(string $description, string $slug): void
    {
        $data = $this->postJson('/api/v1/ai/triage', ['description' => $description])->assertOk()->json('data');

        $this->assertSame($slug, $data['matches'][0]['category']['slug'] ?? null, $description);
    }

    public static function problems(): array
    {
        return [
            'urdu tap' => ['کچن کا نلکا ٹپک رہا ہے', 'plumbing'],
            'urdu ac' => ['میرا اے سی ٹھنڈا نہیں کر رہا', 'ac-hvac'],
            'urdu fan' => ['پنکھا نہیں چل رہا', 'electrical'],
            'urdu termite' => ['الماری میں دیمک لگ گئی ہے', 'pest-control'],
            'urdu fridge' => ['فریج ٹھنڈا نہیں کرتا', 'refrigerator-repair'],
            'urdu car' => ['گاڑی سٹارٹ نہیں ہو رہی', 'roadside-help'],
            'urdu mobile' => ['موبائل کی سکرین ٹوٹ گئی', 'mobile-phone-repair'],
            'urdu arabic letters' => ['ميرا فريج خراب ہے', 'refrigerator-repair'],
            'roman tap' => ['kitchen ki tonti se pani tapak raha hai', 'plumbing'],
            'roman fan' => ['pankha nahi chal raha', 'electrical'],
            'roman seepage' => ['deewar mein seelan aa gayi hai', 'waterproofing'],
            'roman bike' => ['motorcycle kharab hai start nahi hoti', 'bike-mechanic'],
            'typo' => ['my refrigrator is not working', 'refrigerator-repair'],
            'typo plumber' => ['need a plumbr urgently', 'plumbing'],
            'fridge not cooling' => ['the fridge is not cooling', 'refrigerator-repair'],
            'ac not cooling' => ['the AC is not cooling', 'ac-hvac'],
            'only a symptom' => ['it is not cooling at all', 'ac-hvac'],
        ];
    }

    public function test_urdu_emergencies_are_caught(): void
    {
        $this->postJson('/api/v1/ai/triage', ['description' => 'کچن میں گیس کی بو آ رہی ہے'])
            ->assertOk()
            ->assertJsonPath('data.is_emergency', true)
            ->assertJsonPath('data.emergency.type', 'gas_leak');
    }

    public function test_nothing_matched_offers_something_else(): void
    {
        $data = $this->postJson('/api/v1/ai/triage', ['description' => 'I need someone to assemble a baby crib and hang a swing'])
            ->assertOk()->json('data');

        $this->assertSame([], $data['matches']);
        $this->assertSame('something-else', $data['custom_category']['slug']);
        $this->assertTrue($data['custom_category']['is_custom']);
    }

    public function test_something_else_is_also_offered_alongside_matches(): void
    {
        $this->postJson('/api/v1/ai/triage', ['description' => 'The kitchen tap is leaking'])
            ->assertOk()
            ->assertJsonPath('data.matches.0.category.slug', 'plumbing')
            ->assertJsonPath('data.custom_category.slug', 'something-else');
    }

    public function test_site_search_understands_urdu_too(): void
    {
        $slugs = collect($this->getJson('/api/v1/search?q='.urlencode('نلکا ٹپک رہا ہے'))->assertOk()->json('data.categories'))->pluck('slug');
        $this->assertSame('plumbing', $slugs->first());

        $slugs = collect($this->getJson('/api/v1/search?q=pankha')->assertOk()->json('data.categories'))->pluck('slug');
        $this->assertContains('electrical', $slugs->all());
        $this->assertNotContains('something-else', $slugs->all());
    }

    public function test_english_words_inside_other_words_still_do_not_match(): void
    {
        $data = $this->postJson('/api/v1/ai/triage', ['description' => 'please come back to my place'])->assertOk()->json('data');

        $this->assertNotContains('ac-hvac', collect($data['matches'])->pluck('category.slug')->all());
    }
}
