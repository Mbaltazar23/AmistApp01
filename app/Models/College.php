<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class College extends Model {

    use HasFactory;

    protected $table = 'colleges';
    
    protected $fillable = [
        'dni',
        'name',
        'address',
        'phone',
        'status',
        'created_at'
    ];

    public function usersCollege() {
        return $this->hasMany(CollegeUser::class);
    }

    public function courses() {
        return $this->hasMany(Course::class);
    }

}
