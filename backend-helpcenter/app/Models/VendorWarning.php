<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorWarning extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'warning_type',
        'message',
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }
}
