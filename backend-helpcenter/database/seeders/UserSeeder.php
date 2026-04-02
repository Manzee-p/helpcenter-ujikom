<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@helpdesk.com'],
            [
                'name' => 'Admin Helpdesk',
                'phone' => '081234567890',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // Vendors
        User::updateOrCreate(
            ['email' => 'vendor.sound@helpdesk.com'],
            [
                'name' => 'Vendor Sound System',
                'phone' => '081234567891',
                'password' => Hash::make('password'),
                'role' => 'vendor',
            ]
        );

        User::updateOrCreate(
            ['email' => 'vendor.lighting@helpdesk.com'],
            [
                'name' => 'Vendor Lighting',
                'phone' => '081234567892',
                'password' => Hash::make('password'),
                'role' => 'vendor',
            ]
        );

        // Clients
        User::updateOrCreate(
            ['email' => 'rina@company.com'],
            [
                'name' => 'Rina Pratama',
                'phone' => '081234567893',
                'password' => Hash::make('password'),
                'role' => 'client',
            ]
        );

        User::updateOrCreate(
            ['email' => 'budi@company.com'],
            [
                'name' => 'Budi Santoso',
                'phone' => '081234567894',
                'password' => Hash::make('password'),
                'role' => 'client',
            ]
        );
    }
}
