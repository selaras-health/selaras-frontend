// src/constants/healthParameters.ts

/**
 * Parameter kesehatan dasar yang selalu ditampilkan.
 */
export const healthParameters  = [
	{
		key: 'sbp',
		title: '1. Tekanan Darah Sistolik (SBP)',
		unit: 'mmHg',
		proxyQuestions: [
			{
				key: 'familyHistory',
				label: 'Riwayat hipertensi keluarga?',
				type: 'radio',
				options: ['Ya', 'Tidak', 'Tidak Tahu'],
			},
			{
				key: 'sleepPattern',
				label: 'Pola tidur?',
				type: 'radio',
				options: ['Nyenyak', 'Tidak Nyenyak', 'Insomnia'],
			},
			{
				key: 'foodConsumption',
				label: 'Konsumsi makanan sering?',
				type: 'checkbox',
				options: ['Mie instan', 'Daging olahan', 'Camilan asin'],
			},
			{
				key: 'stressResponse',
				label: 'Respons saat stres?',
				type: 'radio',
				options: ['Jantung berdebar', 'Sakit kepala', 'Tidak ada'],
			},
			{
				key: 'bodyShape',
				label: 'Bentuk tubuh?',
				type: 'radio',
				options: ['Perut buncit', 'Gemuk merata', 'Ideal'],
			},
			{
				key: 'exerciseFreq',
				label: 'Frekuensi olahraga?',
				type: 'radio',
				options: ['Rutin & Intens', 'Rutin ringan', 'Jarang'],
			},
		],
	},
	{
		key: 'totalCholesterol',
		title: '2. Kolesterol Total',
		unit: 'mmol/L',
		proxyQuestions: [
			{
				key: 'familyHistory',
				label: 'Riwayat kolesterol / penyakit jantung keluarga?',
				type: 'radio',
				options: ['Ya', 'Tidak', 'Tidak Tahu'],
			},
			{
				key: 'cookingOil',
				label: 'Minyak masak yang dominan?',
				type: 'radio',
				options: ['Sawit', 'Jagung', 'Zaitun'],
			},
			{
				key: 'exerciseType',
				label: 'Jenis olahraga dominan?',
				type: 'radio',
				options: ['Angkat beban', 'Lari', 'Jalan kaki', 'Tidak pernah'],
			},
			{
				key: 'fishConsumption',
				label: 'Konsumsi ikan laut berlemak?',
				type: 'radio',
				options: ['Sering', 'Kadang', 'Jarang'],
			},
			{
				key: 'xanthelasma',
				label: 'Xanthelasma?',
				type: 'radio',
				options: ['Ya', 'Tidak', 'Tidak yakin'],
			},
		],
	},
	{
		key: 'hdlCholesterol',
		title: '3. HDL Kolesterol',
		unit: 'mmol/L',
		proxyQuestions: [
			{
				key: 'familyHistory',
				label: 'Riwayat kolesterol / penyakit jantung keluarga?',
				type: 'radio',
				options: ['Ya', 'Tidak', 'Tidak Tahu'],
			},
			{
				key: 'cookingOil',
				label: 'Minyak masak yang dominan?',
				type: 'radio',
				options: ['Sawit', 'Jagung', 'Zaitun'],
			},
			{
				key: 'exerciseType',
				label: 'Jenis olahraga dominan?',
				type: 'radio',
				options: ['Angkat beban', 'Lari', 'Jalan kaki', 'Tidak pernah'],
			},
			{
				key: 'fishConsumption',
				label: 'Konsumsi ikan laut berlemak?',
				type: 'radio',
				options: ['Sering', 'Kadang', 'Jarang'],
			},
		],
	},
];

/**
 * Parameter tambahan yang hanya ditampilkan jika pengguna memiliki riwayat diabetes.
 */
export const diabetesSpecificParameters = [
	{
		key: 'hba1c',
		title: '4. HbA1c',
		unit: '%',
		proxyQuestions: [
			{
				key: 'bloodSugarCheck',
				label: 'Frekuensi cek gula darah?',
				type: 'radio',
				options: ['Sesuai target', 'Di atas target', 'Jarang', 'Tidak pernah'],
			},
			{
				key: 'medicationCompliance',
				label: 'Kepatuhan obat & diet?',
				type: 'radio',
				options: ['Disiplin keduanya', 'Disiplin obat saja', 'Lupa obat', 'Kurang disiplin keduanya'],
			},
		],
	},
	{
		key: 'serumCreatinine',
		title: '5. Serum Creatinine',
		unit: 'μmol/L',
		proxyQuestions: [
			{
				key: 'bodyType',
				label: 'Tipe tubuh?',
				type: 'radio',
				options: ['Sangat berotot', 'Atletis', 'Rata-rata', 'Kurus'],
			},
			{
				key: 'diabetesComplications',
				label: 'Komplikasi diabetes (mata/syaraf)?',
				type: 'radio',
				options: ['Ya', 'Tidak', 'Tidak tahu'],
			},
			{
				key: 'foamyUrine',
				label: 'Urine berbusa?',
				type: 'radio',
				options: ['Sering', 'Kadang', 'Tidak'],
			},
			{
				key: 'swelling',
				label: 'Pembengkakan di mata/kaki?',
				type: 'radio',
				options: ['Sering', 'Kadang', 'Tidak'],
			},
			{
				key: 'painMedication',
				label: 'Konsumsi obat nyeri non-paracetamol?',
				type: 'radio',
				options: ['Sering', 'Cukup', 'Jarang'],
			},
		],
	},
];

/**
 * Peta untuk mencocokkan kunci pertanyaan di frontend dengan kunci di backend/API.
 */
export const proxyKeyMap: Record<string, string> = {
	// SBP
	familyHistory: 'q_fam_htn',
	sleepPattern: 'q_sleep_pattern',
	foodConsumption: 'q_salt_diet',
	stressResponse: 'q_stress_response',
	bodyShape: 'q_body_shape',
	exerciseFreq: 'q_exercise',

	// Total Cholesterol
	cookingOil: 'q_cooking_oil',
	exerciseType: 'q_exercise_type',
	fishConsumption: 'q_fish_intake',
	xanthelasma: 'q_xanthoma',

	// HDL Cholesterol (Anda mungkin perlu menambahkan kunci yang relevan di sini)
	// Contoh:
	// healthyFatIntake: 'q_healthy_fat_intake',
	// alcohol: 'q_alcohol',

	// HbA1c
	bloodSugarCheck: 'q_smbg_monitoring',
	medicationCompliance: 'q_adherence',

	// Serum Creatinine
	bodyType: 'q_body_type_for_scr',
	diabetesComplications: 'q_retinopathy_neuropathy',
	foamyUrine: 'q_foamy_urine',
	swelling: 'q_swelling',
	painMedication: 'q_nsaid_use',
};
