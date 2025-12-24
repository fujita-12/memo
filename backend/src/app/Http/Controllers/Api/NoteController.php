<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notebook;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Notebook $notebook)
    {
        $this->authorizeNotebook($request, $notebook);

        return $notebook->notes()
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Notebook $notebook)
    {
        $this->authorizeNotebook($request, $notebook);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
        ]);

        $note = $notebook->notes()->create($validated);

        return response()->json($note, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Note $note)
    {
        $this->authorizeNote($request, $note);
        return $note;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Note $note)
    {
        $this->authorizeNote($request, $note);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
        ]);

        $note->update($validated);

        return $note;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Note $note)
    {
        $this->authorizeNote($request, $note);

        $note->delete();

        return response()->noContent();
    }

    private function authorizeNotebook(Request $request, Notebook $notebook): void
    {
        abort_if($notebook->user_id !== $request->user()->id, 403);
    }

    private function authorizeNote(Request $request, Note $note): void
    {
        // note → notebook → user_id を辿って本人確認
        $note->loadMissing('notebook');
        abort_if($note->notebook->user_id !== $request->user()->id, 403);
    }
}
