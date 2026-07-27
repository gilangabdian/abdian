<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Traits\ImageUploadTrait;

class ProjectController extends Controller
{
    use ImageUploadTrait;
    public function index(Request $request)
    {
        $query = Project::query();

        // Fitur Filter: Jika frontend mengirim ?featured=1, ambil yang featured saja
        if ($request->has('featured') && $request->featured == '1') {
            $query->where('is_featured', true);
        }

        // PERBAIKAN DI SINI: Tambahkan with('skills') agar relasi skill ikut terambil
        $projects = $query->with('skills')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }
    public function show($id)
    {
        $project = Project::with('skills')->findOrFail($id);
        return response()->json($project);
    }

    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $mimeType = $file->getMimeType();
            $resourceType = str_starts_with($mimeType, 'video/') ? 'video' : 'image';
            
            $data['thumbnail_path'] = $this->handleFileUpload($file, 'projects', null, $resourceType);
            $data['media_type'] = $resourceType;
        }

        $project = Project::create($data);

        if (array_key_exists('tech_stack_ids', $data)) {
            $project->skills()->sync($data['tech_stack_ids'] ?? []);
        }

        return response()->json(['message' => 'Project created', 'data' => $project->load('skills')], 201);
    }

    public function update(UpdateProjectRequest $request, $id)
    {
        $project = Project::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $mimeType = $file->getMimeType();
            $resourceType = str_starts_with($mimeType, 'video/') ? 'video' : 'image';
            
            $data['thumbnail_path'] = $this->handleFileUpload($file, 'projects', $project->thumbnail_path, $resourceType);
            $data['media_type'] = $resourceType;
        }

        // Handle thumbnail removal when no new file is uploaded
        if (!$request->hasFile('thumbnail') && $request->boolean('remove_thumbnail')) {
            $this->deleteFile($project->thumbnail_path);
            $data['thumbnail_path'] = null;
            $data['media_type'] = null;
        }

        // Hapus remove_thumbnail dari data agar tidak ikut mass-assignment
        unset($data['remove_thumbnail']);

        $project->update([
            'title' => $data['title'],
            'description' => $data['description'],
            'is_featured' => $data['is_featured'] ?? false,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'status' => $data['status'],
            'type' => $data['type'] ?? null,
            'team_size' => $data['team_size'] ?? null,
            'role' => $data['role'] ?? null,
            'live_demo_link' => $data['live_demo_link'] ?? null,
            'repository_link' => $data['repository_link'] ?? null,
            'custom_tech_stacks' => $data['custom_tech_stacks'] ?? null,
            'youtube_url' => $data['youtube_url'] ?? null,
            'twitter_url' => $data['twitter_url'] ?? null,
            'thumbnail_path' => array_key_exists('thumbnail_path', $data) ? $data['thumbnail_path'] : $project->thumbnail_path,
            'media_type' => array_key_exists('media_type', $data) ? $data['media_type'] : $project->media_type,
        ]);

        if (array_key_exists('tech_stack_ids', $data)) {
            $project->skills()->sync($data['tech_stack_ids'] ?? []);
        }

        return response()->json(['message' => 'Project updated', 'data' => $project->load('skills')]);
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $this->deleteFile($project->thumbnail_path);
        $project->delete();
        return response()->json(['message' => 'Project deleted']);
    }
}
