<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class EmailChangeRequestedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $approveToken,
        public string $cancelToken,
        public string $newEmail,
        public int $ttlMinutes = 60,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontend = rtrim(config('app.frontend_url'), '/');

        // router 版
        $approveUrl = $frontend . '/email/approve?token=' . urlencode($this->approveToken);
        $cancelUrl  = $frontend . '/email/cancel?token='  . urlencode($this->cancelToken);

        return (new MailMessage)
            ->subject('【重要】メールアドレス変更のリクエストがありました')
            ->line('あなたのアカウントでメールアドレス変更リクエストが行われました。')
            ->line('変更先: ' . $this->newEmail)
            ->line("心当たりがある場合は「承認」を押してください（有効期限 {$this->ttlMinutes} 分）。")
            ->action('承認する（新メールに確定リンクを送る）', $approveUrl)
            ->line("心当たりがない場合は、こちらから拒否してください： [拒否する]({$cancelUrl})");
    }
}
