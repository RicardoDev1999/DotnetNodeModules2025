using System.Text.Json;

namespace WebApplication1.Helpers
{
    public static class AssetHelper
    {
        private static DateTime? _lastManifestWriteTime;
        private static Dictionary<string, string> _manifestCache;

        // Gets asset path from the webpack manifest file
        public static string GetAssetPath(IWebHostEnvironment env, string assetName)
        {
            var manifestPath = Path.Combine(env.WebRootPath, "dist", "asset-manifest.json");

            if (env.IsDevelopment())
            {
                var manifestWriteTime = File.GetLastWriteTimeUtc(manifestPath);
                if(_lastManifestWriteTime != null && _lastManifestWriteTime.Value < manifestWriteTime)
                {
                    _manifestCache = null!;
                }
                _lastManifestWriteTime = manifestWriteTime;
            }

            // Load the manifest file if not already cached
            if (_manifestCache == null)
            {
                if (File.Exists(manifestPath))
                {
                    try
                    {
                        var manifestContent = File.ReadAllText(manifestPath);
                        var manifest = JsonDocument.Parse(manifestContent);

                        _manifestCache = new Dictionary<string, string>();

                        // Extract file paths from the manifest
                        var filesProperty = manifest.RootElement.GetProperty("files");
                        foreach (var property in filesProperty.EnumerateObject())
                        {
                            _manifestCache[property.Name] = property.Value.GetString();
                        }
                    }
                    catch (Exception ex)
                    {
                        // Fall back to non-hashed paths if manifest can't be read
                        _manifestCache = new Dictionary<string, string>();
                        Console.Error.WriteLine($"Error reading asset manifest: {ex.Message}");
                    }
                }
                else
                {
                    // Fall back to non-hashed paths if manifest doesn't exist
                    _manifestCache = new Dictionary<string, string>();
                }
            }

            // Get the hashed filename from the manifest, or fall back to the regular name
            if (_manifestCache.TryGetValue(assetName, out var hashedPath))
            {
                return hashedPath;
            }

            // Fall back to a default path
            return $"/dist/{assetName}";
        }
    }
}