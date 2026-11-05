<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Marketplace\JobCompletion;
use Illuminate\Console\Command;

/**
 * Applies job deadlines that have passed: marks long-running jobs done and
 * confirms jobs nobody disputed. Scheduled hourly; the same rules also run
 * whenever a job is opened, so nothing depends on the scheduler alone.
 */
class SettleJobsCommand extends Command
{
    protected $signature = 'pakfix:settle-jobs';

    protected $description = 'Mark long-running jobs done and confirm undisputed ones';

    public function handle(JobCompletion $completion): int
    {
        $changed = $completion->settleAll();
        $this->info("Settled {$changed} job(s).");

        return self::SUCCESS;
    }
}
