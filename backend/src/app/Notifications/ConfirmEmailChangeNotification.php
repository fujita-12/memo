<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ConfirmEmailChangeNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $token,
        public string $email,
        public int $ttlMinutes = 60
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontend = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        $url = $frontend . '/email/confirm'
            . '?token=' . urlencode($this->token)
            . '&email=' . urlencode($this->email);

        return (new MailMessage)
            ->subject('メールアドレス変更の確認')
            ->line('メールアドレス変更を受け付けました。下のボタンから確定してください。')
            ->action('メール変更を確定する', $url)
            ->line('心当たりがない場合は、このメールを無視してください。')
            ->line("このリンクの有効期限は {$this->ttlMinutes} 分です。");
    }
}
