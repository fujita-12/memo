<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PasswordItem extends Model
{
    protected $fillable = [
        'password_list_id',
        'title',
        'secret',
    ];

    public function list(): BelongsTo
    {
        return $this->belongsTo(PasswordList::class, 'password_list_id');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(PasswordEntry::class, 'password_item_id');
    }

    //  一覧の3行プレビューで使う「最新entry」
    public function latestEntry(): HasOne
    {
        return $this->hasOne(PasswordEntry::class, 'password_item_id')->latestOfMany();
    }
}
