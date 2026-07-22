<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\UpdateSkillRequest;
use App\Models\Skill;
use Illuminate\Support\Facades\Storage;
use App\Traits\ImageUploadTrait;

class SkillController extends Controller
{
    use ImageUploadTrait;
    public function index()
    {
        return response()->json(Skill::orderBy('order_number', 'asc')->get());
    }

    public function store(StoreSkillRequest $request)
    {
        // 1. Ambil data yang sudah divalidasi (name, identifier, category)
        $data = $request->validated();

        // 2. Langsung simpan ke database
        // (Tidak ada proses upload file lagi karena 'identifier' cuma teks biasa)
        $skill = Skill::create($data);

        return response()->json([
            'message' => 'Skill created successfully',
            'data' => $skill,
        ], 201);
    }

    public function update(UpdateSkillRequest $request, $id)
    {
        $skill = Skill::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('icon')) {
            $data['icon_path'] = $this->handleFileUpload(
                $request->file('icon'),
                'skills',
                $skill->icon_path
            );
        }

        $skill->update($data);

        return response()->json(['message' => 'Skill updated', 'data' => $skill]);
    }

    public function show($id)
    {
        return response()->json(Skill::findOrFail($id));
    }

    public function destroy($id)
    {
        $skill = Skill::findOrFail($id);
        $this->deleteFile($skill->icon_path);

        $skill->delete();

        return response()->json(['message' => 'Skill deleted']);
    }

    public function bulkDelete(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:skills,id'
        ]);

        $skills = Skill::whereIn('id', $request->ids)->get();
        foreach ($skills as $skill) {
            $this->deleteFile($skill->icon_path);
        }

        Skill::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => 'Skills deleted successfully'
        ]);
    }

    public function reorder(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'ordered_ids' => 'required|array',
            'ordered_ids.*' => 'integer|exists:skills,id'
        ]);

        $ids = $request->ordered_ids;
        // Kita loop melalui ID, lalu set order_number berdasarkan posisi index-nya.
        // Array yang dikirim frontend sudah berurutan dari 0, 1, 2, ...
        foreach ($ids as $index => $id) {
            Skill::where('id', $id)->update(['order_number' => $index]);
        }

        return response()->json([
            'message' => 'Skills reordered successfully'
        ]);
    }

    public function updateCategory(\Illuminate\Http\Request $request, $oldName)
    {
        $request->validate([
            'newName' => 'required|string|max:255'
        ]);

        $newName = $request->newName;

        // Update di tabel skills
        Skill::where('category', $oldName)->update(['category' => $newName]);

        // Cek dan update Profile jika kategori ini di-hidden atau jadi default
        $profile = \App\Models\Profile::first();
        if ($profile) {
            $changed = false;
            
            if ($profile->default_skill_category === $oldName) {
                $profile->default_skill_category = $newName;
                $changed = true;
            }

            if (is_array($profile->hidden_skill_categories)) {
                $hidden = $profile->hidden_skill_categories;
                $index = array_search($oldName, $hidden);
                if ($index !== false) {
                    $hidden[$index] = $newName;
                    $profile->hidden_skill_categories = $hidden;
                    $changed = true;
                }
            }

            if ($changed) {
                $profile->save();
            }
        }

        return response()->json([
            'message' => 'Kategori berhasil diubah menjadi ' . $newName
        ]);
    }

    public function destroyCategory($categoryName)
    {
        // 1. Update skills that have this category to 'Uncategorized'
        Skill::where('category', $categoryName)->update(['category' => 'Uncategorized']);

        // 2. Clean up Profile
        $profile = \App\Models\Profile::first();
        if ($profile) {
            $changed = false;
            
            // Remove from default if it was the default
            if ($profile->default_skill_category === $categoryName) {
                $profile->default_skill_category = null;
                $changed = true;
            }

            // Remove from hidden if it was hidden
            if (is_array($profile->hidden_skill_categories)) {
                $hidden = $profile->hidden_skill_categories;
                $index = array_search($categoryName, $hidden);
                if ($index !== false) {
                    unset($hidden[$index]);
                    $profile->hidden_skill_categories = array_values($hidden);
                    $changed = true;
                }
            }

            if ($changed) {
                $profile->save();
            }
        }

        return response()->json([
            'message' => 'Kategori berhasil dihapus dan skill didalamnya dipindahkan ke Uncategorized'
        ]);
    }
}
