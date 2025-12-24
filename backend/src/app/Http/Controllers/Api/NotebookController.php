<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notebook;
use Illuminate\Http\Request;

class NotebookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Notebook::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $notebook = Notebook::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
        ]);

        return response()->json($notebook, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Notebook $notebook)
    {
        $this->authorizeNotebook($request, $notebook);

        return $notebook->load('notes');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Notebook $notebook)
    {
        $this->authorizeNotebook($request, $notebook);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $notebook->update($validated);

        return $notebook;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Notebook $notebook)
    {
        $this->authorizeNotebook($request, $notebook);

        $notebook->delete();

        return response()->noContent();
    }

    private function authorizeNotebook(Request $request, Notebook $notebook): void
    {
        abort_if($notebook->user_id !== $request->user()->id, 403);
    }
}
