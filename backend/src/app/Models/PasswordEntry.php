<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'password_item_id',
        'title',
        'body',
    ];

    public function item()
    {
        return $this->belongsTo(PasswordItem::class, 'password_item_id');
    }
}
