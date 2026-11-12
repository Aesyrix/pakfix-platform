<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web routes
|--------------------------------------------------------------------------
| PakFix renders no Blade pages: the website is the built Next.js app,
| served by App\Http\Controllers\FrontendController (registered in
| bootstrap/app.php), and everything else is the API.
*/

// Pages for services PakFix does not offer were removed; old links land on
// the nearest real page instead of a 404.
Route::permanentRedirect('/for-service-companies', '/become-a-technician');
Route::permanentRedirect('/for-property-managers', '/how-it-works');
Route::permanentRedirect('/home-maintenance', '/services');
