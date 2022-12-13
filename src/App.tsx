import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Configuration, OpenAIApi } from 'openai'
import { z } from 'zod'

import { cx } from './utils'

const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})
const openAi = new OpenAIApi(configuration)

const schema = z.object({
  adjective: z.string().min(1, { message: '// This field is required!' })
})

type Schema = z.infer<typeof schema>

const App = (): JSX.Element => {
  const [suggestion, setSuggestion] = useState<string>('')
  const methods = useForm<Schema>({
    resolver: zodResolver(schema)
  })

  const { register, handleSubmit: formSubmit, formState: { errors } } = methods

  const combineWords = async (secondWord: string): Promise<unknown> => {
    try {
      const result = await openAi.createCompletion({
        model: 'text-davinci-002',
        prompt: `Combine the word "very" with another adjective to find a more suitable adjective.\n\nvery + cold = freezing\nvery + nice = charming\nvery + high = steep\nvery + shining = gleaming\nvery + ${secondWord} =`,
        temperature: 0.7,
        max_tokens: 25,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })

      if (
        result.data.choices?.[0].text === null ||
        result.data.choices?.[0].text === undefined
      ) {
        return new Error('Invalid response')
      }
      const suggestion = result.data.choices[0].text

      setSuggestion(suggestion)
      return suggestion
    } catch (error) {
      if (error instanceof Error) {
        return new Error('Error => ', error)
      }
    }
  }

  const handleSubmit = async (value: Schema): Promise<void> => {
    await combineWords(value.adjective)
  }

  return (
    <FormProvider {...methods}>
      <form
        className='max-w-6xl mx-auto min-h-screen flex flex-col items-center mt-32 mb-16 sm:text-center sm:mb-0'
        onSubmit={formSubmit(handleSubmit)}
      >
        <div className='w-12 h-12'>
          <img
            src='https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ficon-icons.com%2Ficons2%2F931%2FPNG%2F512%2Fpencil_icon-icons.com_72386.png&amp;f=1&amp;nofb=1'
            alt="Pencil icon"
            loading="lazy"
          />
        </div>
        <div className='text-neutral-500 text-center'>
          Combine &quot;very&quot; with a simple adjective and get a more concise adjective
        </div>
        <div className='flex flex-col space-y-6 md:grid md:grid-cols-12 justify-center items-center w-full mb-4 py-16'>
          <p className='text-center md:col-span-2 text-xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold'>very</p>
          <p className='text-center md:col-span-1 text-xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold'>+</p>
          <input
            className={cx(
              'md:col-span-4 text-center border-b-2 font-sans text-xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold pb-6 transition duration-200 bg-white appearance-none focus:outline-none',
              errors.adjective !== undefined ? 'border-red-500' : 'border-gray-600'
            )}
            placeholder='boring'
            {...register('adjective')}
            type='text'
          />
          <p className='text-center col-span-1 text-xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold'>=</p>
          <div className='text-center  w-96 col-span-4'>
          <p
            className={cx(
              'cursor-pointer text-center text-xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold',
              suggestion.trim() !== '' ? 'text-green-700' : 'text-gray-500',
              'font-serif'
            )}>
            {suggestion ?? 'tedious'}
          </p>
        </div>
          <div className='text-center  w-96 col-span-4'>
            <p className='cursor-pointer text-center text-xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-serif'>
            </p>
          </div>
        </div>
        <div className='mb-4 flex flex-row'>
          <button
            type='submit'
            className='cursor-pointer border-solid bg-black inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-deep-purple-accent-400 hover:bg-deep-purple-accent-700 focus:shadow-outline focus:outline-none'>
            Get/Refresh Result
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

export default App
