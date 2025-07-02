<?php
// ServiceController.php
namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::with('category')
            ->orderBy('name')
            ->get();
        
        $categories = Category::active()->orderBy('name')->get();

        return Inertia::render('Services', [
            'services' => $services,
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:services',
            'tarif' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $service = Service::create($validated);

        return response()->json([
            'message' => 'Service created successfully',
            'service' => $service->load('category')
        ]);
    }

    public function show(Service $service)
    {
        $service->load('category');
        return response()->json($service);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:services,code,' . $service->id,
            'tarif' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $service->update($validated);

        return response()->json([
            'message' => 'Service updated successfully',
            'service' => $service->load('category')
        ]);
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully'
        ]);
    }
}