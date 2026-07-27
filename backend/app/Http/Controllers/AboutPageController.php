<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateAboutPageRequest;
use App\Models\AboutPage;

class AboutPageController extends Controller
{
    /**
     * Public: Get the About Page content.
     *
     * Returns the first (and only) row. If the content is null,
     * the frontend will fall back to its hardcoded content.
     */
    public function index()
    {
        $about = AboutPage::first();

        if (! $about) {
            return response()->json([
                'data' => null,
                'message' => 'About page has not been set up yet.',
            ]);
        }

        return response()->json([
            'data' => $about,
        ]);
    }

    /**
     * Admin: Update the About Page content.
     */
    public function update(UpdateAboutPageRequest $request)
    {
        $about = AboutPage::first();

        if (! $about) {
            $about = new AboutPage();
        }

        $about->content = $request->input('content');
        $about->save();
        $about->refresh();

        return response()->json([
            'message' => 'About page updated successfully.',
            'data' => $about,
        ]);
    }
}
