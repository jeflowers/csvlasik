# ClearSight CMS - Upload Directory

## Overview
This directory contains all uploaded media files for the ClearSight CMS system. The structure is organized by media type for efficient management and security.

## Directory Structure

```
uploads/
├── images/          # Optimized images (JPEG, PNG, WebP)
├── videos/          # Video content (MP4, MOV, MPEG)
├── documents/       # Documents (PDF, DOC, DOCX)
└── temp/            # Temporary processing files
```

## Security Features

### File Validation
- **Type Checking**: MIME type validation for all uploads
- **Size Limits**: 50MB maximum per file
- **Virus Scanning**: Ready for production antivirus integration
- **Path Traversal Protection**: UUID-based filenames

### Access Control
- **Authentication Required**: All uploads require valid JWT token
- **Role-Based Permissions**: Different upload rights per user role
- **Audit Logging**: Complete upload activity tracking
- **Secure Serving**: Files served through Express with security headers

## File Processing

### Images
- **Automatic Optimization**: Sharp-based compression and resizing
- **Format Conversion**: JPEG to WebP conversion for modern browsers
- **Responsive Variants**: Multiple sizes generated automatically
- **Metadata Extraction**: EXIF data processing and storage

### Videos
- **Format Validation**: Supported formats enforced
- **Thumbnail Generation**: Automatic video thumbnail creation
- **Compression**: Size optimization for web delivery
- **Streaming Ready**: Prepared for progressive download

### Documents
- **PDF Optimization**: Size reduction while maintaining quality
- **Text Extraction**: Content indexing for search functionality
- **Version Control**: Document revision tracking
- **Access Logging**: Detailed download tracking

## Usage Guidelines

### Upload Limits
- **Images**: 10MB maximum, auto-optimized
- **Videos**: 50MB maximum
- **Documents**: 25MB maximum
- **Total Request**: 50MB per upload request

### Naming Convention
- **Format**: `{uuid}.{extension}`
- **Example**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`
- **Benefits**: Prevents conflicts, enhances security, enables caching

### File Organization
- **By Type**: Automatic sorting into appropriate subdirectories
- **By Date**: Optional date-based organization for large volumes
- **By Category**: Medical, educational, testimonial categorization
- **By Privacy**: Different handling for patient vs. general content

## Maintenance

### Cleanup Procedures
- **Temporary Files**: Automatic cleanup after 24 hours
- **Orphaned Files**: Weekly scan for unreferenced uploads
- **Old Versions**: Configurable retention policy
- **Failed Uploads**: Immediate cleanup of incomplete transfers

### Monitoring
- **Disk Usage**: Regular monitoring of directory sizes
- **Upload Success Rate**: Tracking of successful vs. failed uploads
- **Performance Metrics**: Upload speed and processing time monitoring
- **Security Events**: Failed upload attempts and suspicious activity

### Backup Strategy
- **Daily Backups**: Automated backup of all upload directories
- **Incremental Sync**: Only changed files backed up
- **Offsite Storage**: Secure cloud backup for disaster recovery
- **Integrity Verification**: Regular checksum validation

## Development Notes

### Local Development
- **Hot Reload**: Changes reflected immediately in development
- **Debug Logging**: Detailed upload process logging
- **Error Simulation**: Test error handling scenarios
- **Performance Testing**: Upload speed and optimization testing

### Production Deployment
- **CDN Integration**: Ready for content delivery network setup
- **Load Balancing**: Multiple server upload handling
- **Monitoring Integration**: APM and logging service compatibility
- **Scaling Preparation**: Architecture supports horizontal scaling

## Troubleshooting

### Common Issues
1. **Permission Errors**: Ensure proper directory permissions (755)
2. **Disk Space**: Monitor available storage space
3. **Upload Failures**: Check file size and type restrictions
4. **Processing Errors**: Verify Sharp and other dependencies

### Error Codes
- **400**: Invalid file type or size
- **413**: File too large
- **500**: Server processing error
- **507**: Insufficient storage space

For technical support, check the server logs and ensure all dependencies are properly installed.