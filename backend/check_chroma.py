from rag.vectorstore.collections import get_collection

col = get_collection()
print("Total chunks:", col.count())

res = col.get(limit=1000)
if res["metadatas"]:
    crops = {}
    files = {}
    for m in res["metadatas"]:
        crop = m.get("crop", "unknown")
        f    = m.get("source_file", "unknown")
        crops[crop] = crops.get(crop, 0) + 1
        files[f]    = files.get(f, 0) + 1

    print("\nChunks by crop:")
    for k, v in sorted(crops.items()):
        print(f"  {k}: {v}")

    print("\nChunks by file:")
    for k, v in sorted(files.items()):
        print(f"  {k}: {v}")
else:
    print("No metadata found — ChromaDB may be empty")
