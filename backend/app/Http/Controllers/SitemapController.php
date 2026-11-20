<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Profile;
use Illuminate\Http\Request;

class SitemapController extends Controller
{
    private function getActiveStaticRoutes(): array
    {
        $profile = Profile::first();
        $isAboutActive = $profile ? ($profile->is_about_page_active !== false) : true;
        $isCertificatesActive = $profile ? ($profile->is_certificates_page_active !== false) : true;
        $isProjectsActive = $profile ? ($profile->is_projects_page_active !== false) : true;

        $staticRoutes = [
            '/' => '1.0',
        ];

        if ($isAboutActive) {
            $staticRoutes['/about'] = '0.8';
        }

        if ($isProjectsActive) {
            $staticRoutes['/projects'] = '0.9';
            $staticRoutes['/projects/day-one'] = '0.7';
        }

        $staticRoutes['/blogs'] = '0.9';

        if ($isCertificatesActive) {
            $staticRoutes['/certificates'] = '0.7';
        }

        $staticRoutes['/artworks'] = '0.7';
        $staticRoutes['/photos'] = '0.7';

        return $staticRoutes;
    }

    public function index(Request $request)
    {
        $blogs = Blog::where('is_published', true)->orderBy('created_at', 'desc')->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        $staticRoutes = $this->getActiveStaticRoutes();

        $baseUrl = rtrim(config('app.frontend_url', 'https://abdian.my.id'), '/');

        foreach ($staticRoutes as $route => $priority) {
            $xml .= '<url>';
            $xml .= '<loc>' . $baseUrl . $route . '</loc>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>' . $priority . '</priority>';
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

    public function prerenderRoutes()
    {
        $blogs = Blog::where('is_published', true)->get();

        $routes = array_keys($this->getActiveStaticRoutes());

        foreach ($blogs as $blog) {
            $routes[] = '/blogs/' . $blog->slug;
        }

        return response()->json($routes);
    }
}
