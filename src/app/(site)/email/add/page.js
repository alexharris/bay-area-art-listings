import AddEmailForm from '../../../components/addEmailForm'
// import { createClient } from '@supabase/supabase-js'

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// )

export default function EmailForm() {
  // async function submitEmail(formData) {
  //   'use server'
    
  //   const email = formData.get('email')
    
  //   try {
  //     const { error } = await supabase
  //       .from('emails')
  //       .insert([{ email: email }])

  //     if (error) throw error

  //     // You could redirect here if you want to show a success page
  //     // redirect('/success')
  //   } catch (error) {
  //     console.error('Error:', error)
  //     // You could redirect here if you want to show an error page
  //     // redirect('/error')
  //   }
  // }

  return (
    <div>
      <AddEmailForm />
      {/* <h2>Submit Your Email</h2>
      <form action={submitEmail}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
        />
        <button type="submit">Submit</button>
      </form> */}
    </div>
  )
}
