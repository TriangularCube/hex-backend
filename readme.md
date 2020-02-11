#### Message conventions

Responses come in form

```json
{
    "success": true/false,
    "error": "this is the error",
    "errorMessage": "message from the underlying error",
    
    // Other fields returned from a success
    ...otherFields
}
```
