<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    protected $fillable = [
        'notebook_id',
        'title',
        'body',
    ];

    public function notebook(): BelongsTo
    {
        return $this->belongsTo(Notebook::class);
    }
}
