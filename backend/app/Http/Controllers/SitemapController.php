<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Project;
use Illuminate\Http\Request;

class SitemapController extends Controller
{
    public function index(Request $request)
    {
        $projects = Project::orderBy('created_at', 'desc')->get();
        $blogs = Blog::where('is_published', true)->orderBy('created_at', 'desc')->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Static routes
        $staticRoutes = [
            '/' => '1.0',
            '/about' => '0.8',
            '/projects' => '0.9',
            '/blogs' => '0.9',
            '/certificates' => '0.7',
            '/artworks' => '0.7',
            '/photos' => '0.7',
            '/contacts' => '0.6',
        ];

        $baseUrl = 'https://abdian.vercel.app';

        foreach ($staticRoutes as $route => $priority) {
            $xml .= '<url>';
            $xml .= '<loc>' . $baseUrl . $route . '</loc>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>' . $priority . '</priority>';
            $xml .= '</url>';
        }

        // Dynamic Projects
        foreach ($projects as $project) {
            $xml .= '<url>';
            $xml .= '<loc>' . $baseUrl . '/projects/' . $project->id . '</loc>';
            $xml .= '<lastmod>' . $project->updated_at->toAtomString() . '</lastmod>';
            $xml .= '<changefreq>monthly</changefreq>';
            $xml .= '<priority>0.8</priority>';
            $xml .= '</url>';
        }

        // Dynamic Blogs
        foreach ($blogs as $blog) {
            $xml .= '<url>';
            $xml .= '<loc>' . $baseUrl . '/blogs/' . $blog->slug . '</loc>';
            $xml .= '<lastmod>' . $blog->updated_at->toAtomString() . '</lastmod>';
            $xml .= '<changefreq>monthly</changefreq>';
            $xml .= '<priority>0.8</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return response($xml, 200)->header('Content-Type', 'text/xml');
    }
}
