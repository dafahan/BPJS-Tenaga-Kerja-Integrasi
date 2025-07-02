<?php
// ActionController.php
namespace App\Http\Controllers;

use App\Models\Action;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActionController extends Controller
{
    public function index()
    {
        $actions = Action::with('category')
            ->orderBy('name')
            ->get();
        
        $categories = Category::active()->orderBy('name')->get();

        return Inertia::render('Actions', [
            'actions' => $actions,
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:actions',
            'tarif' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $action = Action::create($validated);

        return response()->json([
            'message' => 'Action created successfully',
            'action' => $action->load('category')
        ]);
    }

    public function show(Action $action)
    {
        $action->load('category');
        return response()->json($action);
    }

    public function update(Request $request, Action $action)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:actions,code,' . $action->id,
            'tarif' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $action->update($validated);

        return response()->json([
            'message' => 'Action updated successfully',
            'action' => $action->load('category')
        ]);
    }

    public function destroy(Action $action)
    {
        $action->delete();

        return response()->json([
            'message' => 'Action deleted successfully'
        ]);
    }
}
