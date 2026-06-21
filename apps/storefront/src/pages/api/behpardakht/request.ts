import MellatCheckout from 'mellat-checkout'
import type { NextApiRequest, NextApiResponse } from 'next';

export const behpardakht = new MellatCheckout({
    terminalId: process.env.BEHPARDAKHT_TERMINALID || "7517617",
    username: process.env.BEHPARDAKHT_USERNAME || "7517617",
    password: process.env.BEHPARDAKHT_PASSWORD || "32733567",
    timeout: process.env.BEHPARDAKHT_TIMEOUT || 10000,
    apiUrl:
        process.env.BEHPARDAKHT_API_URL ||
        "https://bpm.shaparak.ir/pgwchannel/services/pgw?wsdl",
})

behpardakht
    .initialize()
    .then(function () {
        console.log("Mellat client ready")
    })
    .catch(function (error: any) {
        // you can retry here
        console.log("Mellat client encountered error:", error)
    })

const bpRequest = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(JSON.parse(req.body))
    const { amount, payerId, orderId } = JSON.parse(req.body)
    try {
        const response = await behpardakht.paymentRequest({
            amount,
            orderId,
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/behpardakht/callback`,
            payerId: payerId || "0", // Optional
        })
        console.log(response)
        if (response.resCode === 0) {

            
            res.status(200).json(response)
        } else {
            console.warn("Gateway Error: ", response.resCode)
            res.status(400).json({ errorMessage: errors[response.resCode], resCode: response.resCode })
        }

    } catch (e) {
        console.log('Error, something went wrong.', e);
        res.setHeader('Cache-Control', 'no-store');
        res.status(400).json({ error: 'Unexpected error', code: 400 });
    }
};

export const errors: Record<string, string> = {
    '11': 'است نامعتبر كارت شماره',
    '12': 'نيست كافي موجودي',
    '13': 'است نادرست رمز',
    '14': 'است مجاز حد از بيش رمز كردن وارد دفعات تعداد',
    '15': 'است نامعتبر كارت',
    '16': 'است مجاز حد از بيش وجه برداشت دفعات',
    '17': 'است شده منصرف تراكنش انجام از كاربر',
    '18': 'است گذشته كارت انقضاي تاريخ',
    '19': 'است مجاز حد از بيش وجه برداشت مبلغ',
    '111': 'است نامعتبر كارت كننده صادر',
    '112': 'كارت كننده صادر سوييچ خطاي',
    '113': 'نشد دريافت كارت كننده صادر از پاسخي',
    '114': 'نيست تراكنش اين انجام به مجاز كارت دارنده',
    '21': 'است نامعتبر پذيرنده',
    '23': 'است داده رخ امنيتي خطاي',
    '24': 'است نامعتبر پذيرنده كاربري اطلاعات',
    '25': 'است نامعتبر مبلغ',
    '31': 'است نامعتبر پاسخ',
    '32': 'باشد نمي صحيح شده وارد اطلاعات فرمت',
    '33': 'است نامعتبر حساب',
    '34': 'سيستمي خطاي',
    '35': 'است نامعتبر تاريخ',
    '41': 'است تكراري درخواست شماره',
    '42': 'نشد يافت Sale تراكنش',
    '43': 'است شده داده Verify درخواست قبلا',
    '44': 'نشد يافت Verfiy درخواست',
    '45': 'است شده Settle تراكنش',
    '46': 'است نشده Settle تراكنش',
    '47': 'نشد يافت Settle تراكنش',
    '48': 'است شده Reverse تراكنش',
    '49': 'نشد يافت Refund تراكنش',
    '412': 'است نادرست قبض شناسه',
    '413': 'است نادرست پرداخت شناسه',
    '414': 'است نامعتبر قبض كننده صادر سازمان',
    '415': 'است رسيده پايان به كاري جلسه زمان',
    '416': 'اطلاعات ثبت در خطا',
    '417': 'است نامعتبر كننده پرداخت شناسه',
    '418': 'مشتري اطلاعات تعريف در اشكال',
    '419': 'است گذشته مجاز حد از اطلاعات ورود دفعات تعداد',
    '421': 'است نامعتبر IP',
    '51': 'است تكراري تراكنش',
    '54': 'نيست موجود مرجع تراكنش',
    '55': 'است نامعتبر تراكنش',
    '61': 'واريز در خطا',
  };
  
  export const IPGConfigErrors = [
    '21',
    '24',
    '25',
    '31',
    '32',
    '33',
    '35',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '412',
    '413',
    '414',
    '417',
    '51',
    '54',
    '55',
  ];
  
  export const IPGUserErrors = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '111', '112', '113', '114'];
  
  export const IPGFailureErrors = ['23', '34', '416', '61'];


export default bpRequest;