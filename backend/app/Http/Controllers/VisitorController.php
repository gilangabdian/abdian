<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Jenssegers\Agent\Agent;

class VisitorController extends Controller
{
    /**
     * Store a newly created resource in storage it doesn't already exist.
     */
    public function store(Request $request)
    {
        // No request validation as per user request
        if (!$request->device_id) {
            return response()->json(['message' => 'device_id is required'], 400);
        }

        $agent = new Agent();
        $agent->setUserAgent($request->userAgent());

        if ($agent->isRobot()) {
            return response()->json(['message' => 'Bots are not logged.'], 200);
        }

        $existingVisitor = Visitor::where('device_id', $request->device_id)->first();
        
        $locationData = [
            'ip_address' => $request->ip_address ?: null,
            'city'       => $request->city ?: null,
            'region'     => $request->region ?: null,
            'country'    => $request->country ?: null,
            'isp'        => $request->isp ?: null,
        ];

        $deviceType = 'desktop';
        if ($agent->isTablet()) {
            $deviceType = 'tablet';
        } elseif ($agent->isMobile()) {
            $deviceType = 'mobile';
        }

        $updateData = [
            'device_type' => $deviceType,
            'os'          => $agent->platform() ?: null,
            'browser'     => $agent->browser() ?: null,
            'device_name' => $agent->device() ?: null,
        ];

        if (!$existingVisitor) {
            $updateData = array_merge($updateData, $locationData);
        }

        $visitor = Visitor::updateOrCreate(
            ['device_id' => $request->device_id],
            $updateData
        );

        return response()->json([
            'message' => 'Visitor logged successfully.',
            'data' => $visitor
        ], 201);
    }

    /**
     * Get the total count of 'left_mark'.
     */
    public function getMarkCount(Request $request)
    {
        $totalMarks = Visitor::where('left_mark', true)->count();
        $alreadyMarked = false;

        if ($request->device_id) {
            $visitor = Visitor::where('device_id', $request->device_id)->first();
            if ($visitor && $visitor->left_mark) {
                $alreadyMarked = true;
            }
        }

        return response()->json([
            'message' => 'Mark count retrieved successfully',
            'data' => [
                'total_marks' => $totalMarks,
                'already_marked' => $alreadyMarked
            ]
        ], 200);
    }

    /**
     * Set left_mark to true for a specific device_id.
     */
    public function leaveMark(Request $request)
    {
        if (!$request->device_id) {
            return response()->json(['message' => 'device_id is required'], 400);
        }

        $visitor = Visitor::where('device_id', $request->device_id)->first();

        if (!$visitor) {
            // Log visitor silently if not exists
            $agent = new Agent();
            $agent->setUserAgent($request->userAgent());
            $visitor = Visitor::create([
                'device_id' => $request->device_id,
                'left_mark' => false,
                'device_type' => $agent->isTablet() ? 'tablet' : ($agent->isMobile() ? 'mobile' : 'desktop'),
                'os' => $agent->platform() ?: null,
                'browser' => $agent->browser() ?: null,
                'device_name' => $agent->device() ?: null,
            ]);
        }

        $alreadyMarked = $visitor->left_mark;

        if (!$alreadyMarked) {
            $visitor->left_mark = true;
            $visitor->save();
        }

        $totalMarks = Visitor::where('left_mark', true)->count();

        return response()->json([
            'message' => $alreadyMarked ? 'Already marked' : 'Mark left successfully',
            'data' => [
                'already_marked' => $alreadyMarked,
                'total_marks' => $totalMarks
            ]
        ], 200);
    }

    /**
     * Get all visitors (Admin Only)
     */
    public function index()
    {
        $visitors = Visitor::orderBy('updated_at', 'desc')->paginate(10);
        return response()->json($visitors);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Visitor $visitor)
    {
        $visitor->delete();
        return response()->json(['message' => 'Visitor record deleted successfully']);
    }

    /**
     * Remove all resources from storage.
     */
    public function clearAll()
    {
        Visitor::truncate();
        return response()->json(['message' => 'All visitor records cleared successfully']);
    }

    /**
     * Get the total count of visitors.
     */
    public function count()
    {
        $count = Visitor::count();

        return response()->json([
            'message' => 'Visitor count retrieved successfully',
            'data' => [
                'total_visitors' => $count
            ]
        ], 200);
    }
}
