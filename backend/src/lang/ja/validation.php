<?php

return [

    'required' => ':attribute は必須です。',
    'email' => ':attribute の形式が正しくありません。',
    'unique' => 'この:attributeは既に使用されています。',
    'confirmed' => ':attribute（確認用）が一致しません。',
    'min' => [
        'string' => ':attribute は:min文字以上で入力してください。',
    ],

    // 表示名（attribute）を日本語にする
    'attributes' => [
        'name' => '名前',
        'email' => 'メールアドレス',
        'password' => 'パスワード',
        'password_confirmation' => 'パスワード（確認）',
    ],
];
