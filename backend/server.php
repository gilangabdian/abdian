<?php

$publicPath = getcwd();

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

// Emulate Apache's "mod_rewrite" functionality from the built-in PHP web server,
// while adding production-like HTTP caching headers (matching Cloudinary's
// Cache-Control: max-age=2592000, immutable) for local /storage/* files.
if ($uri !== '/' && file_exists($publicPath.$uri)) {
    $filePath = $publicPath.$uri;

    if (str_starts_with($uri, '/storage/') && is_file($filePath)) {
        $mtime = filemtime($filePath) ?: time();
        $size = filesize($filePath) ?: 0;
        $etag = '"'.md5($filePath.'|'.$mtime.'|'.$size).'"';
        $lastModified = gmdate('D, d M Y H:i:s', $mtime).' GMT';
        $mime = mime_content_type($filePath) ?: 'application/octet-stream';

        header('Cache-Control: public, max-age=2592000, immutable');
        header('ETag: '.$etag);
        header('Last-Modified: '.$lastModified);
        header('Access-Control-Allow-Origin: *');

        $ifNoneMatch = isset($_SERVER['HTTP_IF_NONE_MATCH']) ? trim($_SERVER['HTTP_IF_NONE_MATCH']) : '';
        if ($ifNoneMatch === $etag) {
            http_response_code(304);
            return true;
        }

        header('Content-Type: '.$mime);
        header('Content-Length: '.$size);

        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD') {
            return true;
        }

        readfile($filePath);
        return true;
    }

    return false;
}

$formattedDateTime = date('D M j H:i:s Y');

$requestMethod = $_SERVER['REQUEST_METHOD'];
$remoteAddress = $_SERVER['REMOTE_ADDR'].':'.$_SERVER['REMOTE_PORT'];

file_put_contents('php://stdout', "[$formattedDateTime] $remoteAddress [$requestMethod] URI: $uri\n");

require_once $publicPath.'/index.php';
