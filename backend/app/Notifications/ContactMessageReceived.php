<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Tells the support inbox a contact form message has arrived. Queued. */
class ContactMessageReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly ContactMessage $contactMessage)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = $this->contactMessage;

        return (new MailMessage())
            ->subject("[PakFix contact] {$message->subject}")
            // Replying goes straight to the person who wrote in.
            ->replyTo($message->email, $message->name)
            ->greeting('New contact form message')
            ->line("From: {$message->name} <{$message->email}>" . ($message->phone ? ", {$message->phone}" : ''))
            ->line('Topic: ' . ucfirst($message->topic))
            ->line("Subject: {$message->subject}")
            ->line($message->message);
    }
}
