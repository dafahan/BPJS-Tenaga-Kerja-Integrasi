<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Service;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with(['services'])
            ->withCount(['services'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Categories', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:categories',
            'description' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $category = Category::create($validated);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'category' => $category->load(['services'])
            ]);
        }

        return redirect()->back()->with('success', 'Category created successfully');
    }

    public function show(Category $category)
    {
        $category->load(['services']);
        
        return response()->json($category);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:categories,code,' . $category->id,
            'description' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $category->update($validated);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'category' => $category->load(['services'])
            ]);
        }

        return redirect()->back()->with('success', 'Category updated successfully');
    }

    public function destroy(Category $category)
    {
        try {
            $category->delete();
            
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Category deleted successfully'
                ]);
            }

            return redirect()->back()->with('success', 'Category deleted successfully');
        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category: ' . $e->getMessage()
                ], 422);
            }

            return redirect()->back()->with('error', 'Cannot delete category: ' . $e->getMessage());
        }
    }

    public function getItems(Category $category)
    {
        $services = $category->services()->active()->get();

        return response()->json([
            'services' => $services,
        ]);
    }
}