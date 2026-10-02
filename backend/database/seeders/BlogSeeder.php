<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\CmsPage;
use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Launch articles and the About page.
 *
 * These are written to be genuinely useful rather than to fill a grid: a blog
 * with five real guides does more for search and trust than one with fifty
 * thin ones. Bodies are Markdown; the API renders them to HTML with raw HTML
 * stripped.
 */
class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::where('email', 'admin@pakfix.pk')->first();

        foreach ($this->posts() as $index => $post) {
            $model = BlogPost::firstOrCreate(
                ['slug' => Str::slug($post['title'])],
                [
                    'title' => $post['title'],
                    'excerpt' => $post['excerpt'],
                    'body' => trim($post['body']),
                    'blog_category_id' => BlogCategory::where('slug', $post['category'])->value('id'),
                    'service_category_id' => ServiceCategory::where('slug', $post['service'])->value('id'),
                    'author_id' => $author?->id,
                    'seo_title' => $post['title'],
                    'seo_description' => $post['excerpt'],
                    'cta_label' => $post['cta_label'],
                    'cta_url' => $post['cta_url'],
                    'is_featured' => $index === 0,
                    'status' => BlogPost::STATUS_PUBLISHED,
                    'published_at' => now()->subDays(($index + 1) * 6),
                ]
            );

            $tagIds = collect($post['tags'])->map(fn (string $name) => BlogTag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            )->id);

            $model->tags()->sync($tagIds);
        }

        CmsPage::firstOrCreate(
            ['slug' => 'about'],
            [
                'title' => 'About PakFix',
                'body' => trim($this->aboutBody()),
                'seo_title' => 'About PakFix',
                'seo_description' => 'PakFix helps Pakistani households understand what is wrong at home and find a verified professional to fix it.',
                'is_system' => true,
                'is_published' => true,
            ]
        );

        $this->command?->info(sprintf('Seeded %d blog posts and the About page.', count($this->posts())));
    }

    private function posts(): array
    {
        return [
            [
                'title' => 'Why Your AC Is Running but Not Cooling',
                'excerpt' => 'Before you pay for a gas refill, check the three causes that account for most AC cooling problems in Pakistani summers.',
                'category' => 'ac',
                'service' => 'ac-hvac',
                'tags' => ['AC', 'Summer', 'DIY checks'],
                'cta_label' => 'Book an AC technician',
                'cta_url' => '/services/ac-hvac',
                'body' => <<<'MD'
An AC that runs but blows warm air is the most common repair call of the summer. It is also the one most often "fixed" with a gas refill that was never needed.

## 1. A dirty filter

The indoor unit's filter catches dust. In Lahore or Karachi in June it can clog within a few weeks, and a clogged filter starves the coil of air.

**Safe to check yourself:** switch the AC off at the wall, open the front panel, and slide the filter out. If it is grey and matted, rinse it in plain water, let it dry completely, and refit it.

## 2. A blocked outdoor unit

The outdoor unit has to push heat out of the house. If its coil is caked in dust, or it is boxed in by a wall, a cover or stored furniture, it cannot.

**Safe to check yourself:** look, do not touch. Make sure nothing is within half a metre of the unit and the fan turns when the AC is running.

## 3. Low refrigerant

Refrigerant does not get "used up". If it is low, it is leaking. A refill without finding the leak means paying again next month.

## When to call a professional

- The filter is clean and the outdoor unit is clear, and it still does not cool
- Ice forms on the indoor coil or the pipes
- The breaker trips when the compressor starts
- You see oily residue near the pipe joints

A general service costs far less than a compressor, and twice-yearly servicing is what keeps most ACs out of the repair queue.
MD,
            ],
            [
                'title' => 'Gas Smell at Home: What to Do in the First Five Minutes',
                'excerpt' => 'A gas smell is an emergency, not a repair job. Here is exactly what to do, and what never to do.',
                'category' => 'home-maintenance',
                'service' => 'emergency-repair',
                'tags' => ['Safety', 'Emergency', 'Gas'],
                'cta_label' => 'Read the PakFix safety guide',
                'cta_url' => '/safety',
                'body' => <<<'MD'
If you smell gas at home, this is not a problem to diagnose. It is a problem to leave.

## Do this now

1. **Do not switch anything on or off.** Not a light, not a fan, not the UPS. A switch can spark.
2. **Do not light a match, a lighter or a stove.**
3. **Close the gas valve** at the meter or the cylinder, only if you can reach it without walking through the smell.
4. **Open doors and windows** on your way out.
5. **Get everyone out,** including pets, and move away from the building.
6. **Call your gas company's emergency line from outside.** Use your phone only once you are outdoors.

## Do not

- Look for the leak with a flame
- Start a generator or a car near the house
- Go back inside until the gas company says it is safe

## Why PakFix will not talk you through this

When the PakFix assistant recognises a gas leak, electrical fire, exposed high-voltage wiring, structural collapse or flooding, it classifies the problem as an emergency and gives only safety instructions. It will not offer repair steps, because following repair advice from a screen in that situation is how people get hurt.

Once the gas company has made the line safe, a professional can repair the fitting or appliance that leaked.
MD,
            ],
            [
                'title' => 'Water Tank Cleaning: How Often and Why It Matters',
                'excerpt' => 'Sediment and algae build up in overhead tanks faster than most people think. A simple schedule keeps your water clean.',
                'category' => 'home-maintenance',
                'service' => 'water-tank',
                'tags' => ['Water', 'Maintenance schedule'],
                'cta_label' => 'Book water tank cleaning',
                'cta_url' => '/services/water-tank',
                'body' => <<<'MD'
Most homes in Pakistan store water in an overhead or underground tank. Whatever the supply looks like when it arrives, it sits in that tank for days, often in heat.

## What builds up

- **Sediment** settles at the bottom and stirs up whenever the motor fills the tank
- **Algae** grows wherever light gets in through a loose or cracked lid
- **Biofilm** coats the walls and is not removed by simply draining the tank

## How often

**Every six months** is a sensible default. Clean sooner if:

- Tap water looks cloudy or discoloured
- You notice a smell from the taps
- The lid has been left open or has cracked

## What a proper clean includes

1. Draining the tank completely
2. Scrubbing the walls and floor, not just rinsing them
3. Removing the sludge from the bottom
4. Disinfecting and rinsing thoroughly
5. Checking the lid, the float valve and the overflow

Add the tank to your property in PakFix and set a six-month reminder, so it does not depend on remembering.
MD,
            ],
            [
                'title' => 'Preparing Your Home for Monsoon Season',
                'excerpt' => 'A short checklist of roof, drain, electrical and damp checks worth doing before the first heavy rain.',
                'category' => 'pakistan-home-guides',
                'service' => 'waterproofing',
                'tags' => ['Monsoon', 'Checklist', 'Waterproofing'],
                'cta_label' => 'Find a waterproofing professional',
                'cta_url' => '/services/waterproofing',
                'body' => <<<'MD'
The first heavy rain of the monsoon finds every weakness in a house at once. An afternoon of checks in June saves most of the repair calls in August.

## Roof and drains

- Clear leaves and plastic from roof drains and gutters
- Look for cracks around water tanks and parapet walls, where most roof leaks start
- Check that water can actually flow off the roof rather than pooling

## Walls and damp

- Walk the house looking for fresh damp patches, bubbling paint or salt marks
- Seal gaps around window frames and AC pipe holes

## Electrical

- Check that outdoor sockets and lights have covers
- Make sure no wiring runs where water collects
- Know where your main breaker is, and make sure everyone at home does too

**If water reaches wiring, a socket or the distribution board, switch off the power at the main breaker if you can do so without standing in water, and call an electrician. Do not touch anything electrical while standing in water.**

## Doors and wood

Wooden doors swell in humid weather. If a door already sticks in June, it will not close in August; a carpenter can plane it now.
MD,
            ],
            [
                'title' => 'Getting More Backup Time from Your UPS',
                'excerpt' => 'Load shedding is hard on batteries. How to tell when a UPS battery is failing, and how to make it last.',
                'category' => 'appliances',
                'service' => 'ups-inverter',
                'tags' => ['UPS', 'Load shedding', 'Batteries'],
                'cta_label' => 'Book a UPS technician',
                'cta_url' => '/services/ups-inverter',
                'body' => <<<'MD'
If your UPS used to run the fans for three hours and now manages one, the battery is the usual suspect.

## Signs the battery is failing

- Backup time has dropped noticeably
- The UPS beeps or shows a battery warning soon after the power goes
- Tubular batteries need topping up with water far more often than before
- The battery case is swollen, cracked or leaking

**A swollen or leaking battery is damaged. Switch the UPS off, unplug it and keep the area ventilated until a technician replaces it.**

## Making a battery last

- **Do not overload it.** Run fans and lights, not the iron, the kettle or an AC
- **Keep it ventilated.** Heat shortens battery life more than anything else
- **Top up tubular batteries** with distilled water only, never tap water
- **Keep terminals clean** and tight

## Battery or inverter?

If a new battery still gives short backup time, the charger or inverter may be at fault. A technician can test both, which is cheaper than replacing a battery that was never the problem.
MD,
            ],
        ];
    }

    private function aboutBody(): string
    {
        return <<<'MD'
Something breaks at home. The AC stops cooling in the middle of June, or water appears under the sink. What follows is usually a round of phone calls, a technician who may or may not turn up, and a price nobody explains.

PakFix exists to make that simpler.

## What PakFix does

- **Helps you understand the problem.** Describe it or send a photo, and get a plain-language explanation of what is likely wrong, how serious it is, and what it typically costs to fix.
- **Connects you with verified professionals.** Every professional on PakFix has had their identity checked by a person before they can take a job.
- **Keeps the price clear.** You see a quote and accept it before work starts.
- **Remembers your home.** Every repair, appliance and service date stays on your property's record.

## What we will not do

We will not talk you through a dangerous repair. Gas leaks, exposed wiring, structural damage and flooding are treated as emergencies: you get safety instructions and a route to a professional, never repair steps.

## Where we work

PakFix is live in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Gujranwala, Sialkot, Hyderabad and Abbottabad, and growing.
MD;
    }
}
