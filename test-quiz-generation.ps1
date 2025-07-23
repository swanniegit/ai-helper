# PowerShell script to test quiz generation endpoint
# This script helps you get a valid session token and test the quiz API

$baseUrl = "http://localhost:3000"

function Test-QuizEndpoint {
    param(
        [Parameter(Mandatory=$true)]
        [string]$SessionToken,
        [string]$SkillCategory = "PHP OOP",
        [string]$Difficulty = "beginner",
        [int]$QuestionCount = 5
    )
    
    Write-Host "🔵 Testing quiz generation..." -ForegroundColor Blue
    
    $headers = @{
        "Content-Type" = "application/json"
        "Cookie" = "session_token=$SessionToken"
    }
    
    $body = @{
        skill_category = $SkillCategory
        difficulty_level = $Difficulty
        question_count = $QuestionCount
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/quiz/generate" -Method Post -Headers $headers -Body $body
        Write-Host "✅ Quiz generated successfully" -ForegroundColor Green
        Write-Host "📊 Quiz data:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "❌ Quiz generation failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $responseBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseBody)
            $errorDetails = $reader.ReadToEnd()
            Write-Host "Response: $errorDetails" -ForegroundColor Yellow
        }
    }
}

function Get-SessionToken {
    param(
        [string]$Email = "test.quiz@example.com",
        [string]$Password = "testpassword123"
    )
    
    Write-Host "🔵 Getting session token..." -ForegroundColor Blue
    
    # Try login first
    $loginBody = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        
        if ($loginResponse.StatusCode -eq 200) {
            Write-Host "✅ Login successful" -ForegroundColor Green
            
            # Extract session token from Set-Cookie header
            $setCookieHeader = $loginResponse.Headers['Set-Cookie']
            if ($setCookieHeader -match 'session_token=([^;]+)') {
                return $matches[1]
            }
        }
    } catch {
        Write-Host "⚠️ Login failed, trying registration..." -ForegroundColor Yellow
        
        # Try registration
        $registerBody = @{
            email = $Email
            password = $Password
            firstName = "Test"
            lastName = "User"
        } | ConvertTo-Json
        
        try {
            $registerResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
            
            if ($registerResponse.StatusCode -eq 200) {
                Write-Host "✅ Registration successful" -ForegroundColor Green
                
                # Extract session token from Set-Cookie header
                $setCookieHeader = $registerResponse.Headers['Set-Cookie']
                if ($setCookieHeader -match 'session_token=([^;]+)') {
                    return $matches[1]
                }
            }
        } catch {
            Write-Host "❌ Registration also failed: $($_.Exception.Message)" -ForegroundColor Red
            return $null
        }
    }
    
    return $null
}

# Main execution
Write-Host "🚀 Starting quiz generation test..." -ForegroundColor Magenta
Write-Host ""

# Get session token
$sessionToken = Get-SessionToken

if ($sessionToken) {
    Write-Host "🔑 Session token obtained: $($sessionToken.Substring(0, 20))..." -ForegroundColor Green
    Write-Host ""
    
    # Test different quiz configurations
    Write-Host "Testing PHP OOP - Beginner..." -ForegroundColor Cyan
    Test-QuizEndpoint -SessionToken $sessionToken -SkillCategory "PHP OOP" -Difficulty "beginner" -QuestionCount 5
    
    Write-Host "`nTesting Oracle SQL - Beginner..." -ForegroundColor Cyan  
    Test-QuizEndpoint -SessionToken $sessionToken -SkillCategory "Oracle SQL" -Difficulty "beginner" -QuestionCount 3
    
    Write-Host "`nTesting with template_id instead of skill_category..." -ForegroundColor Cyan
    # Test with template_id (you can get template IDs from the database)
    $headers = @{
        "Content-Type" = "application/json"
        "Cookie" = "session_token=$sessionToken"
    }
    
    $templateBody = @{
        template_id = "some-template-uuid"  # Replace with actual template ID
        question_count = 5
    } | ConvertTo-Json
    
    # Note: This will likely fail unless you have the actual template ID
    Write-Host "Note: Template ID test may fail - you need to get actual template IDs from your database" -ForegroundColor Yellow
    
} else {
    Write-Host "❌ Failed to get session token. Make sure your development server is running on $baseUrl" -ForegroundColor Red
}

Write-Host "`n🏁 Test completed" -ForegroundColor Magenta