<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\ContentBlock;
use App\Models\Faq;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * The editable content the public site ships with. Every string here is
 * reachable from the admin dashboard, which is the point: the homepage copy
 * is data, not markup, so marketing can change it without a deploy.
 */
class CmsSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedHomepage();
        $this->seedFaqs();
        $this->seedTestimonials();
        $this->seedBlogCategories();
    }

    private function seedHomepage(): void
    {
        $blocks = [
            [
                'key' => 'home.hero',
                'type' => 'hero',
                'title' => 'Show Us What is Wrong. PakFix Helps You Fix It.',
                'subtitle' => 'Upload a photo, describe the problem, or book a verified professional near you.',
                'cta_label' => 'Diagnose My Problem',
                'cta_url' => '/ai',
                'content' => [
                    'secondary_cta_label' => 'Book a Professional',
                    'secondary_cta_url' => '/find-a-technician',
                    'input_placeholder' => 'What needs fixing?',
                    'examples' => [
                        'My AC is not cooling',
                        'My kitchen tap is leaking',
                        'My washing machine is making noise',
                        'There is a crack in my wall',
                    ],
                ],
            ],
            [
                'key' => 'home.how_it_works',
                'type' => 'service_section',
                'title' => 'How PakFix works',
                'subtitle' => 'Three steps from a problem to a professional.',
                'content' => [
                    'steps' => [
                        [
                            'title' => 'Describe or photograph the problem',
                            'body' => 'Type what is wrong, or send a photo. The assistant asks the questions a good technician would.',
                        ],
                        [
                            'title' => 'Get a plain-language diagnosis',
                            'body' => 'Likely cause, safety level, a realistic cost range, and whether it is safe to look at yourself.',
                        ],
                        [
                            'title' => 'Book a verified professional',
                            'body' => 'Compare nearby professionals by rating and price, then book or request quotes.',
                        ],
                    ],
                ],
            ],
            [
                'key' => 'home.why_pakfix',
                'type' => 'service_section',
                'title' => 'Why choose PakFix',
                'content' => [
                    'points' => [
                        ['title' => 'Verified professionals', 'body' => 'Every technician is identity-checked before a single job.'],
                        ['title' => 'Prices agreed up front', 'body' => 'You see a quote and accept it before work starts.'],
                        ['title' => 'One home, one history', 'body' => 'Every repair is kept against your property, permanently.'],
                        ['title' => 'Safety first', 'body' => 'Dangerous problems are flagged, never talked you through.'],
                    ],
                ],
            ],
            [
                'key' => 'home.technician_cta',
                'type' => 'banner',
                'title' => 'Work with PakFix',
                'subtitle' => 'Get jobs near you, set your own rates, and get paid on time.',
                'cta_label' => 'Become a Professional',
                'cta_url' => '/become-a-technician',
            ],
            [
                'key' => 'home.final_cta',
                'type' => 'hero',
                'title' => 'Something broken at home?',
                'subtitle' => 'Tell PakFix what is wrong and find out what it takes to fix it.',
                'cta_label' => 'Ask PakFix AI',
                'cta_url' => '/ai',
            ],
            [
                'key' => 'footer.contact',
                'type' => 'footer',
                'page' => 'global',
                'title' => 'Contact',
                'content' => [
                    'email' => 'support@pakfix.pk',
                    'phone' => '+92 300 0000000',
                    'address' => 'Lahore, Pakistan',
                    'social' => [
                        'facebook' => '',
                        'instagram' => '',
                        'linkedin' => '',
                    ],
                ],
            ],
        ];

        foreach ($blocks as $index => $block) {
            ContentBlock::firstOrCreate(
                ['key' => $block['key']],
                [
                    'type' => $block['type'],
                    'page' => $block['page'] ?? 'home',
                    'title' => $block['title'] ?? null,
                    'subtitle' => $block['subtitle'] ?? null,
                    'content' => $block['content'] ?? null,
                    'cta_label' => $block['cta_label'] ?? null,
                    'cta_url' => $block['cta_url'] ?? null,
                    'sort_order' => $index,
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedFaqs(): void
    {
        $faqs = [
            ['How does the AI diagnosis work?', 'You describe the problem in your own words, in English or Roman Urdu. PakFix AI suggests the likely cause, how urgent it is, the right service and its usual price range. It is guidance, not a diagnosis: the professional checks on site.', 'general'],
            ['Is PakFix free to use?', 'For customers, yes: creating an account, asking PakFix AI, posting a job and getting offers are free. You pay the professional, in cash, only for the work you agree to.', 'general'],
            ['How are professionals verified?', 'Every professional submits their CNIC (front and back) and a selfie. A member of the PakFix team reviews them by hand before the professional can offer on jobs.', 'safety'],
            ['What if I am not happy with the work?', 'Report a problem from the job in the app. The PakFix team reviews what both sides say and helps resolve it. Payment is in cash between you and the professional, so do not pay until you are satisfied the work is done.', 'safety'],
            ['How do I pay?', 'In cash, to the professional, after you confirm the work is done. Online payments are not available yet.', 'payments'],
            ['Which cities does PakFix cover?', 'PakFix is starting in Islamabad and Rawalpindi. More cities will follow.', 'general'],
            ['What happens in an emergency?', 'Choose Emergency Repair, or Roadside Help for a car or bike. The request goes first to verified professionals nearby who take emergency jobs. PakFix does not promise a fixed response time.', 'safety'],
        ];

        foreach ($faqs as $index => [$question, $answer, $group]) {
            Faq::firstOrCreate(
                ['question' => $question],
                [
                    'answer' => $answer,
                    'group' => $group,
                    'sort_order' => $index,
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedTestimonials(): void
    {
        // No sample testimonials: only real customers' words may be published.
        $testimonials = [];

        foreach ($testimonials as $index => [$name, $location, $rating, $quote]) {
            Testimonial::firstOrCreate(
                ['author_name' => $name, 'quote' => $quote],
                [
                    'author_location' => $location,
                    'rating' => $rating,
                    'is_published' => true,
                    'sort_order' => $index,
                ]
            );
        }
    }


    private function seedBlogCategories(): void
    {
        $categories = [
            'Home Maintenance', 'DIY', 'Electrical Safety', 'Plumbing', 'AC',
            'Appliances', 'Home Improvement', 'Technician Tips',
            'Property Management', 'Pakistan Home Guides',
        ];

        foreach ($categories as $index => $name) {
            BlogCategory::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'sort_order' => $index, 'is_active' => true]
            );
        }
    }
}
