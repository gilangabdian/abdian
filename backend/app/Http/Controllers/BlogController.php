<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Models\Blog;
use Illuminate\Http\Request;
use App\Traits\ImageUploadTrait;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Services\RevalidationService;

class BlogController extends Controller
{
    use ImageUploadTrait;

    // PUBLIK
    public function indexPublic()
    {
        $query = Blog::where('is_published', true)->latest();
        
        if (request()->has('type') && request('type') !== 'all') {
            $query->where('type', request('type'));
        } elseif (!request()->has('type')) {
            $query->where('type', 'blog');
        }

        if (request('type') === 'note') {
            $blogs = $query->get(['id', 'title', 'title_en', 'slug', 'type', 'read_time', 'is_external', 'external_url', 'created_at', 'updated_at', 'content', 'content_en']);
        } else {
            $blogs = $query->get(['id', 'title', 'title_en', 'slug', 'type', 'read_time', 'is_external', 'external_url', 'created_at', 'updated_at']);
        }
        
        return response()->json($blogs);
    }

    public function showPublic($slug)
    {
        $blog = Blog::where('slug', $slug)->where('is_published', true)->firstOrFail();
        return response()->json($blog);
    }

    // ADMIN
    public function indexAdmin()
    {
        $query = Blog::latest();
        
        if (request()->has('type') && request('type') !== 'all') {
            $query->where('type', request('type'));
        }

        $blogs = $query->get();
        return response()->json($blogs);
    }

    public function showAdmin($id)
    {
        $blog = Blog::findOrFail($id);
        return response()->json($blog);
    }

    public function store(StoreBlogRequest $request)
    {
        $data = $request->validated();
        
        if (($data['type'] ?? 'blog') === 'note' && empty($data['title'])) {
            $data['title'] = 'Note ' . now()->format('YmdHis');
        }

        $blog = Blog::create($data);

        RevalidationService::tag('blogs');

        return response()->json([
            'message' => 'Blog created successfully',
            'data' => $blog
        ], 201);
    }

    public function update(UpdateBlogRequest $request, $id)
    {
        $blog = Blog::findOrFail($id);
        $data = $request->validated();
        
        if (($data['type'] ?? $blog->type) === 'note' && empty($data['title'])) {
            $data['title'] = $blog->title ?? 'Note ' . now()->format('YmdHis');
        }
        
        $blog->update($data);

        RevalidationService::tag('blogs');

        return response()->json([
            'message' => 'Blog updated successfully',
            'data' => $blog
        ]);
    }

    public function destroy($id)
    {
        $blog = Blog::findOrFail($id);
        $blog->delete();

        RevalidationService::tag('blogs');

        return response()->json([
            'message' => 'Blog deleted successfully'
        ]);
    }

    // TIPTAP IMAGE UPLOAD
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|mimes:jpeg,png,jpg,gif,svg,webp|max:5120' // max 5MB
        ]);

        $imageUrl = $this->handleFileUpload(
            $request->file('image'),
            'blogs_inline'
        );

        $finalUrl = $this->resolveUrl($imageUrl);

        return response()->json([
            'url' => $finalUrl
        ]);
    }

    private function resolveUrl($path)
    {
        if (empty($path)) return null;
        if (str_starts_with($path, 'http')) {
            return $path;
        }
        return url(Storage::url($path));
    }
}
