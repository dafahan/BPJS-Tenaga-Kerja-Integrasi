<?php

namespace App\Http\Traits;

use Illuminate\Http\Request;

trait HandleAjaxRequests
{
    protected function handleResponse($data, $message = null, $statusCode = 200)
    {
        if (request()->expectsJson() || request()->ajax()) {
            return response()->json([
                'success' => $statusCode >= 200 && $statusCode < 300,
                'message' => $message,
                'data' => $data
            ], $statusCode);
        }

        // For Inertia requests, redirect back or to index
        $redirectPath = $this->getRedirectPath();
        
        if ($message) {
            return redirect($redirectPath)->with('success', $message);
        }
        
        return redirect($redirectPath);
    }

    protected function handleError($message, $statusCode = 422, $errors = [])
    {
        if (request()->expectsJson() || request()->ajax()) {
            return response()->json([
                'success' => false,
                'message' => $message,
                'errors' => $errors
            ], $statusCode);
        }

        // For Inertia requests
        return back()->withErrors(['error' => $message])->withInput();
    }

    protected function getRedirectPath()
    {
        $routeName = request()->route()->getName();
        
        // Extract base route name (remove .store, .update, etc.)
        $baseRoute = explode('.', $routeName)[0] ?? '';
        
        // Common redirect patterns
        $redirectRoutes = [
            'categories' => '/categories',
            'services' => '/services',
            'medicines' => '/medicines',
            'actions' => '/actions',
            'patients' => '/patients',
            'medical-records' => '/medical-records',
            'invoices' => '/invoices',
        ];

        return $redirectRoutes[$baseRoute] ?? '/';
    }
}