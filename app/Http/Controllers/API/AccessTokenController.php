<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\ErrorHandler\Debug;
use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\VideoGrant;

class AccessTokenController extends Controller
{

    public function generate_token(Request $request)
    {
        // Substitute your Twilio Account SID and API Key details
        $accountSid = env('ACCOUNT_SID');
        $apiKeySid = env('API_KEY_SID');
        $apiKeySecret = env('API_KEY_SECRET');

        
        $data = $request->all();

        Log::Debug($data['username']);

        //$identity = uniqid();

        $identity = $data['username'];

        // Create an Access Token
        $token = new AccessToken(
            $accountSid,
            $apiKeySid,
            $apiKeySecret,
            3600,
            $identity
        );

        // Grant access to Video
        $grant = new VideoGrant();
        $grant->setRoom('cool room');
        $token->addGrant($grant);

        // Serialize the token as a JWT
        echo $token->toJWT();
    }
}
