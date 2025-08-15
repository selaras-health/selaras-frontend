import axios from 'axios';

/*
    ANALYSIS
*/

export const newAnalysis = async (token: string, analysisData: any) => {
	try {
		const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/risk-assessments`, analysisData, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			data: analysisData,
		});

		console.log('New analysis created successfully:', response.data);
		return response.data;
	} catch (error) {
		console.error('Failed to create new analysis:', error);
		throw new Error('Failed to create new analysis. Please try again later.');
	}
};

export const personalizeAnalysis = async (token: string, slug: string) => {
	try {
		const response = await axios.patch(
			`${import.meta.env.VITE_BASE_URL}/risk-assessments/${slug}/personalize`,
			{
				message: 'Personalization endpoint reached successfully. Ready for Gemini integration.',
				assessment_slug: slug,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		);
		console.log('Analysis personalized successfully:', response.data);
		return response.data;
	} catch (error) {
		console.error('Failed to personalize analysis:', error);
		throw new Error('Failed to personalize analysis. Please try again later.');
	}
};
