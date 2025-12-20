

namespace backend.Models.Entities
{
    public class Attachment
    {
        public int Id { get; set; } // Attachment ID [cite: 79]
        public int MyTaskId { get; set; } // Related Task ID [cite: 82]
        
        public string OriginalFileName { get; set; } = "" ;// Original Name [cite: 83]
        public string StoragePath { get; set; } = "";// Storage Path/URL [cite: 84]
        public long FileSize { get; set; } // File Size [cite: 86]
        public DateTime UploadDate { get; set; } // Upload Date [cite: 87]
         public int UploaderUserId { get; set; } // Uploader User ID [cite: 89]
    
    }
}