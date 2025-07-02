<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class LoginController extends Controller
{    
    /**
     * index
     *
     * @return void
     */
    public function index()
    {   
        request()->session()->regenerate();
        // Regenerate the CSRF token

        return inertia('Auth/Login', [
            'csrf_token' => csrf_token(), // Pass the CSRF token to the Inertia view
        ]);
    }
    
    /**
     * store
     *
     * @param  mixed $request
     * @return void
     */
    public function store(Request $request)
    {
        // Validate request
        $request->validate([
            'username' => 'required', 
            'password' => 'required'
        ]);
    
        // Get username and password from the request
        $credentials = $request->only('username', 'password');
    
        // Attempt to login with username and password
        if (Auth::attempt($credentials)) {
            // Regenerate session
            $request->session()->regenerate();
            // Redirect to dashboard
            return redirect('/'); 
        }
    
        // If login fails, return error response
        return response()->json([
            'errors' => [
                'username' => 'The provided credentials do not match our records.',
                'password' => 'The provided credentials do not match our records.',
            ]
        ], 422); // Send a 422 status code for validation errors
    }
    
    
    
    

    /**
     * destroy
     *
     * @return void
     */
    public function destroy()
    {
        auth()->logout();
        request()->session()->invalidate();
        
        return redirect()->route('login');
    }
    
}
