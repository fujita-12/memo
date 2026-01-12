<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PasswordList;
use Illuminate\Http\Request;

class PasswordListController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        return PasswordList::query()
            ->where('user_id', $userId)
            ->latest()
            ->get(['id', 'user_id', 'title', 'created_at', 'updated_at']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $list = PasswordList::create([
            'user_id' => $request->user()->id,
            'title' => $data['title'],
        ]);

        return response()->json($list->only(['id', 'user_id', 'title', 'created_at', 'updated_at']), 201);
    }

    public function destroy(Request $request, PasswordList $list)
    {
        if ($list->user_id !== $request->user()->id) {
            abort(404);
        }

        $list->delete();

        return response()->noContent();
    }
}
