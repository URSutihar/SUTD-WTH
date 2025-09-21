export const Legal = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Legal Information</h1>
        <p className="mt-2 text-gray-600">
          Terms of Service, Privacy Policy, and Medical Disclaimers
        </p>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-red-50 border-l-4 border-red-400 p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Medical Disclaimer</h3>
            <div className="mt-2 text-sm text-red-700">
              <p className="mb-4">
                <strong>IMPORTANT:</strong> This application provides general guidance only and is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Always consult with a qualified healthcare provider before taking melatonin or any other supplements</li>
                <li>Do not use this app if you have sleep disorders, mental health conditions, or are taking medications that affect sleep</li>
                <li>Pregnant or breastfeeding individuals should consult their doctor before following any recommendations</li>
                <li>If you experience adverse effects, discontinue use immediately and consult a healthcare provider</li>
                <li>The recommendations are based on general chronobiology principles and may not be suitable for everyone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Terms of Service */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
        <div className="prose prose-sm max-w-none">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By using Snorelags, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
          </p>

          <h3>2. Use of the Application</h3>
          <p>
            Snorelags is designed to provide general guidance for managing jet lag and circadian rhythm adjustments. The application is not intended to diagnose, treat, cure, or prevent any medical condition.
          </p>

          <h3>3. Medical Advice</h3>
          <p>
            The information provided by this application is for educational purposes only and should not be considered medical advice. Always consult with a qualified healthcare provider before making decisions about your health.
          </p>

          <h3>4. User Responsibilities</h3>
          <ul>
            <li>Provide accurate information about your travel plans and preferences</li>
            <li>Consult with healthcare providers before following any recommendations</li>
            <li>Use the application responsibly and in accordance with these terms</li>
            <li>Not use the application for any unlawful purpose</li>
          </ul>

          <h3>5. Limitation of Liability</h3>
          <p>
            Snorelags and its developers shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the application.
          </p>

          <h3>6. Privacy</h3>
          <p>
            We respect your privacy and handle your data in accordance with our Privacy Policy. We do not sell your personal information to third parties.
          </p>

          <h3>7. Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
        <div className="prose prose-sm max-w-none">
          <h3>Information We Collect</h3>
          <ul>
            <li>Account information (email, name) provided through Google OAuth</li>
            <li>Trip data (destinations, dates, preferences) that you voluntarily provide</li>
            <li>Usage data to improve the application</li>
            <li>Health preferences (chronotype, medication preferences) that you choose to share</li>
          </ul>

          <h3>How We Use Your Information</h3>
          <ul>
            <li>To generate personalized jet lag plans</li>
            <li>To save and retrieve your trip history</li>
            <li>To improve our services and user experience</li>
            <li>To provide customer support</li>
          </ul>

          <h3>Data Security</h3>
          <p>
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
          </p>

          <h3>Third-Party Services</h3>
          <p>
            We use Supabase for data storage, Google for authentication, and Gemini for AI processing. These services have their own privacy policies.
          </p>

          <h3>Your Rights</h3>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
          </ul>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
        <p className="text-gray-600">
          If you have any questions about these terms or our privacy practices, please contact us at:
        </p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Email: support@snorelags.com<br />
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
