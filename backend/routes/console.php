<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Job deadlines (auto-complete, auto-confirm). Also applied when a job is opened.
Schedule::command('pakfix:settle-jobs')->hourly()->withoutOverlapping();

// Inbox notifications older than 90 days are removed (InboxNotification::prunable).
Schedule::command('model:prune', ['--model' => [App\Models\InboxNotification::class]])->daily();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
