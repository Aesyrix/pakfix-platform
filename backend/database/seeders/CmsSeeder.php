<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\CmsPage;
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
        $this->seedLegalPages();
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
                'key' => 'home.property_manager_cta',
                'type' => 'banner',
                'title' => 'Managing more than one property?',
                'subtitle' => 'Track maintenance, costs and history across every unit you look after.',
                'cta_label' => 'PakFix for Property Managers',
                'cta_url' => '/for-property-managers',
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
            ['How does the AI diagnosis work?', 'You describe the problem or send a photo. PakFix returns the likely cause, how urgent it is, a realistic cost range and the kind of professional you need. It is guidance, not a guarantee -- the professional confirms on site.', 'general'],
            ['Is PakFix free to use?', 'Creating an account, asking the assistant and requesting quotes are free. You only pay for the work you agree to.', 'general'],
            ['How are professionals verified?', 'Every professional submits identity documents and, where relevant, trade certificates. A member of the PakFix team reviews each one by hand before the profile goes live.', 'safety'],
            ['What if I am not happy with the work?', 'Raise a dispute from the booking within the platform. Support reviews the evidence from both sides and can order a partial or full refund.', 'safety'],
            ['How do I pay?', 'Cash on service and bank transfer are available everywhere. Card, JazzCash and Easypaisa are enabled city by city.', 'payments'],
            ['Which cities does PakFix cover?', 'PakFix is live in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Gujranwala, Sialkot, Hyderabad and Abbottabad, and is expanding.', 'general'],
            ['Can I use PakFix for a rented home?', 'Yes. Mark the property as rented when you add it, and keep the maintenance history with you.', 'general'],
            ['What happens in an emergency?', 'Choose Emergency Repair. The request is raised as high priority and sent to professionals who offer emergency call-outs. PakFix does not promise a fixed response time.', 'safety'],
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
        $testimonials = [
            ['Ayesha S.', 'Lahore', 5, 'I sent a photo of the leak under my sink at 9pm and had a plumber booked for the next morning. The price was what the app said it would be.'],
            ['Bilal A.', 'Karachi', 5, 'The AC diagnosis was right -- low gas, not the compressor. Saved me from being sold a repair I did not need.'],
            ['Sana M.', 'Islamabad', 4, 'Having every repair on the property record is the part I did not expect to like this much.'],
        ];

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

    private function seedLegalPages(): void
    {
        $pages = [
            ['Terms of Service', 'Placeholder terms. Replace with copy reviewed by a Pakistani legal adviser before launch.'],
            ['Privacy Policy', 'Placeholder privacy policy. Must describe how CNIC documents, addresses and payment data are stored and who can access them.'],
            ['Refund Policy', 'Placeholder refund policy covering disputes, partial refunds and the window in which a customer can raise one.'],
            ['Safety', 'How PakFix classifies dangerous problems, what the assistant will not talk you through, and what to do in an emergency.'],
        ];

        foreach ($pages as [$title, $body]) {
            CmsPage::firstOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'title' => $title,
                    'body' => $body,
                    'seo_title' => sprintf('%s | PakFix', $title),
                    'is_system' => true,
                    'is_published' => true,
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
