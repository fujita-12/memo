<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'password_list_id',
        'title',
        'secret',
    ];

    public function list()
    {
        return $this->belongsTo(PasswordList::class, 'password_list_id');
    }

    public function entries()
    {
        return $this->hasMany(PasswordEntry::class, 'password_item_id')->latest();
    }

    public function latestEntry()
    {
        return $this->hasOne(\App\Models\PasswordEntry::class, 'password_item_id')->latestOfMany();
    }
}
