param (
    [int]$Port = 8080,
    [string]$RootDir = "$PSScriptRoot\www"
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Error "Failed to start listener on $prefix : $_"
    exit 1
}

Write-Host "=========================================="
Write-Host " KESF Web Server Started"
Write-Host " URL: $prefix"
Write-Host " Serving directory: $RootDir"
Write-Host "=========================================="

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
    ".eot"  = "application/vnd.ms-fontobject"
    ".mp4"  = "video/mp4"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
        
        # Strip leading slash and normalize
        $relPath = $rawUrl.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relPath)) {
            $relPath = "index.html"
        }

        # Check in $RootDir first, then check project root if not found
        $filePath = Join-Path $RootDir $relPath
        if (-not (Test-Path $filePath -PathType Leaf)) {
            # Try project root
            $altPath = Join-Path $PSScriptRoot $relPath
            if (Test-Path $altPath -PathType Leaf) {
                $filePath = $altPath
            }
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $contentType = $mimeTypes[$ext]
            }

            try {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                $response.StatusCode = 500
            }
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawUrl")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }

        $response.Close()
        Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] $($request.HttpMethod) $rawUrl -> $($response.StatusCode)"
    }
} finally {
    $listener.Stop()
    $listener.Close()
    Write-Host "Server stopped."
}
