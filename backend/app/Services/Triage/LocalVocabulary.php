<?php

declare(strict_types=1);

namespace App\Services\Triage;

/**
 * How people in Pakistan describe home, vehicle and device problems in Urdu
 * script and Roman Urdu, on top of the English words in ProblemTriage.
 *
 * Kept apart so the vocabulary can grow without touching the matching
 * logic. Urdu words are written in their common spelling; ProblemTriage
 * folds Arabic/Persian letter variants and diacritics before comparing.
 */
final class LocalVocabulary
{
    /**
     * category slug => extra keywords.
     *
     * @var array<string, list<string>>
     */
    public const CATEGORIES = [
        'ac-hvac' => [
            'اے سی', 'اےسی', 'ائیر کنڈیشنر', 'ایئر کنڈیشنر', 'ائر کنڈیشنر', 'کولنگ', 
            'ac thanda nahi', 'ac thanda nahin', 'ac ki gas', 'ac service karwani',
        ],
        'plumbing' => [
            'نلکا', 'نل', 'ٹونٹی', 'پائپ', 'لیکیج', 'لیک', 'پانی ٹپک', 'پانی رس', 'گٹر', 'نالی', 'فلش', 'کموڈ', 'سنک',
            'گیزر', 'پلمبر', 'پانی نہیں آ',
            'plumber', 'tonti', 'nalka', 'nal', 'gutter', 'naali', 'nali band', 'pani leak', 'pani tapak', 'pani ris',
            'geezer', 'gizer', 'flush kharab', 'pipe phat', 'pani nahi aa',
        ],
        'electrical' => [
            'بجلی', 'وائرنگ', 'سوئچ', 'سوچ', 'ساکٹ', 'پنکھا', 'بلب', 'لائٹ', 'بریکر', 'شارٹ سرکٹ', 'الیکٹریشن',
            'بجلی نہیں', 'میٹر',
            'electrician', 'bijli', 'pankha', 'light nahi', 'bijli nahi', 'switch kharab', 'socket kharab',
            'fan nahi chal', 'pankha nahi chal', 'breaker gir',
        ],
        'refrigerator-repair' => ['فریج', 'فریزر', 'ریفریجریٹر', 'fridge thanda nahi', 'freezer kharab'],
        'washing-machine-repair' => ['واشنگ مشین', 'کپڑے دھونے کی مشین', 'washing machine kharab', 'machine nahi chal'],
        'kitchen-appliances' => ['مائیکرو ویو', 'مائکروویو', 'اوون', 'چولہا', 'چولھا', 'چمنی', 'chulha', 'choolha'],
        'water-motor' => ['موٹر', 'پمپ', 'پانی کی موٹر', 'motor kharab', 'motor nahi chal', 'pani ki motor'],
        'water-tank' => ['ٹینکی', 'پانی کی ٹینکی', 'ٹینک کی صفائی', 'tanki', 'tanki saaf', 'tanki ki safai'],
        'solar-system' => ['سولر', 'سولر پینل', 'سولر پلیٹ', 'solar plate', 'solar lagwana'],
        'ups-inverter' => ['یو پی ایس', 'بیٹری', 'انورٹر', 'لوڈ شیڈنگ', 'ups kharab', 'battery kharab'],
        'generator' => ['جنریٹر', 'جینریٹر', 'generator kharab', 'generator start nahi'],
        'carpentry' => [
            'دروازہ', 'دروازے', 'الماری', 'کھڑکی', 'کھڑکیاں', 'ترکھان', 'بڑھئی', 'کارپینٹر', 'قبضہ', 'دراز',
            'carpenter', 'tarkhan', 'darwaza', 'darwaza kharab', 'almari', 'khirki', 'kabza',
        ],
        'furniture-repair' => ['صوفہ', 'صوفے', 'کرسی', 'میز', 'پلنگ', 'فرنیچر', 'پالش', 'sofa', 'kursi', 'mez', 'palang', 'furniture polish'],
        'painting' => ['پینٹ', 'رنگ', 'رنگ و روغن', 'پینٹر', 'painter', 'rang', 'rang karwana', 'paint karwana'],
        'wall-repair' => ['دیوار', 'دراڑ', 'پلستر', 'deewar', 'diwar', 'darar', 'plaster'],
        'roof-repair' => ['چھت', 'چھت ٹپک', 'چھت سے پانی', 'chhat tapak', 'chat tapak', 'chhat se pani'],
        'waterproofing' => ['سیلن', 'نمی', 'سیم', 'seelan', 'sealan', 'nami'],
        'pest-control' => [
            'کاکروچ', 'لال بیگ', 'دیمک', 'چوہا', 'چوہے', 'مچھر', 'کھٹمل', 'کیڑے', 'کیڑا', 'چیونٹی', 'چیونٹیاں',
            'دیمک لگ', 'deemak lag', 'deemak', 'dimak', 'choha', 'chuha', 'chuhe', 'machar', 'machhar', 'khatmal', 'keeray', 'keere', 'cheonti',
        ],
        'cleaning' => ['صفائی', 'گھر کی صفائی', 'safai', 'safaai', 'ghar ki safai'],
        'deep-cleaning' => ['مکمل صفائی', 'گہری صفائی', 'deep safai'],
        'door-locks' => ['تالا', 'تالہ', 'چابی', 'لاک', 'tala', 'taala', 'chabi', 'chaabi', 'lock kharab'],
        'cctv' => ['کیمرہ', 'کیمرے', 'سی سی ٹی وی', 'camera lagwana', 'camera kharab'],
        'internet-networking' => ['انٹرنیٹ', 'وائی فائی', 'وائی فائے', 'راؤٹر', 'راوٹر', 'net nahi chal', 'wifi nahi chal', 'internet nahi'],
        'bathroom-repair' => ['باتھ روم', 'غسل خانہ', 'واش روم', 'ghusal khana', 'bathroom kharab'],
        'tiles' => ['ٹائل', 'ٹائلیں', 'ٹائلز', 'tiles lagwani', 'tile toot'],
        'glass-work' => ['شیشہ', 'شیشے', 'آئینہ', 'sheesha', 'shisha', 'aaina'],
        'gardening' => ['باغ', 'باغیچہ', 'لان', 'پودے', 'گھاس', 'مالی', 'maali', 'mali', 'ghaas', 'paude', 'pauday'],
        // Car & Bike
        'roadside-help' => [
            'پنکچر', 'ٹائر', 'گاڑی خراب', 'گاڑی سٹارٹ نہیں', 'گاڑی اسٹارٹ نہیں', 'پٹرول ختم', 'دھکا',
            'puncture', 'panchar', 'gari kharab', 'gaari kharab', 'gari start nahi', 'gaari start nahi', 'petrol khatam', 'dhakka',
        ],
        'car-mechanic' => ['مکینک', 'مستری', 'گاڑی کا انجن', 'بریک', 'کلچ', 'گیئر', 'mistri', 'mechanic chahiye', 'engine kharab', 'gari ka engine'],
        'car-electrician' => ['سیلف', 'الٹرنیٹر', 'ہیڈ لائٹ', 'ہارن', 'self nahi', 'self kharab', 'horn kharab'],
        'car-ac' => ['گاڑی کا اے سی', 'کار اے سی', 'gari ka ac', 'gaari ka ac', 'car ka ac'],
        'car-wash-detailing' => ['گاڑی دھونا', 'گاڑی کی دھلائی', 'کار واش', 'gari dhulai', 'gari wash', 'gaari dhona'],
        'bike-mechanic' => ['موٹر سائیکل', 'موٹرسائیکل', 'بائیک', 'motor cycle', 'motorcycle kharab', 'bike kharab', 'bike start nahi'],
        // Electronics
        'tv-led-repair' => ['ٹی وی', 'ٹیلی ویژن', 'ایل ای ڈی', 'ایل سی ڈی', 'tv kharab', 'tv nahi chal', 'led kharab'],
        'laptop-computer-repair' => ['لیپ ٹاپ', 'لیپٹاپ', 'کمپیوٹر', 'پرنٹر', 'laptop kharab', 'computer kharab'],
        'mobile-phone-repair' => ['موبائل', 'فون', 'سکرین', 'اسکرین', 'mobile kharab', 'phone kharab', 'screen toot', 'charging nahi'],
    ];

    /**
     * category slug => symptom words shared by several services ("not cooling"
     * is an AC, a fridge or a car AC). They count for little, so the thing
     * named ("fridge") decides, and only lean towards this service alone.
     *
     * @var array<string, list<string>>
     */
    public const WEAK = [
        'ac-hvac' => ['not cooling', 'cooling', 'ٹھنڈا نہیں', 'ٹھنڈک نہیں', 'کولنگ نہیں', 'thanda nahi kar', 'cooling nahi'],
    ];

    /**
     * emergency type => extra phrases.
     *
     * @var array<string, list<string>>
     */
    public const EMERGENCIES = [
        'gas_leak' => ['گیس کی بو', 'گیس لیک', 'گیس کی بدبو', 'سلنڈر لیک', 'gas ki smell'],
        'electrical_fire' => ['آگ لگ', 'دھواں', 'چنگاری', 'تار جل', 'dhuwan', 'chingari', 'taar jal'],
        'exposed_wiring' => ['ننگی تار', 'کرنٹ لگ', 'کرنٹ آ', 'جھٹکا لگ', 'current aa', 'jhatka lag'],
        'structural' => ['چھت گر', 'دیوار گر', 'چھت بیٹھ'],
        'flooding' => ['پانی بھر گیا', 'پانی ہی پانی', 'پائپ پھٹ', 'pipe phat gaya'],
        'fuel_leak' => ['پٹرول لیک', 'ڈیزل لیک', 'پٹرول کی بو'],
    ];

    /** Words that say the problem is with a vehicle. */
    public const VEHICLE_WORDS = ['گاڑی', 'کار', 'موٹر سائیکل', 'موٹرسائیکل', 'بائیک', 'gaadi', 'gadi', 'car ka'];
}
