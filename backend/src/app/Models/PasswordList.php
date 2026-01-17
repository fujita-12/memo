<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordList extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(PasswordItem::class)->latest();
    }
}
