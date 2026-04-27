<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ResidentController;
use Illuminate\Support\Facades\Route;

Route::apiResource('residents', ResidentController::class);
Route::apiResource('houses', HouseController::class);
Route::post('houses/{house}/assign', [HouseController::class, 'assignResident']);
Route::post('houses/{house}/vacate', [HouseController::class, 'vacate']);

Route::get('payments/calculate', [PaymentController::class, 'calculate']);
Route::apiResource('payments', PaymentController::class)->only(['index', 'store', 'show']);

Route::apiResource('expenses', ExpenseController::class);

Route::get('dashboard', [DashboardController::class, 'index']);
