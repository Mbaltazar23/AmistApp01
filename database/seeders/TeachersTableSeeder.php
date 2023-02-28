<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeachersTableSeeder extends Seeder
{

    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        DB::table('teachers')->insert([
            [
                'id' => 1,
                'course_id' => 1,
                'user_id' => 4,
                'created_at' => '2023-02-21 20:36:16',
                'updated_at' => '2023-02-21 20:36:16',
            ],
            [
                'id' => 2,
                'course_id' => 3,
                'user_id' => 6,
                'created_at' => '2023-02-23 20:40:45',
                'updated_at' => '2023-02-23 20:40:45',
            ],
        ]);

    }
}