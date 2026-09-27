import { zodResolver } from '@hookform/resolvers/zod'
import { createContext, ReactElement, ReactNode, useContext } from 'react'
import {
  Controller,
  DefaultValues,
  FieldPath,
  FieldValues,
  FormProvider,
  Resolver,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { z } from 'zod'

const FormSubmitContext = createContext<(() => void) | undefined>(undefined)

export interface FormProps<TFieldValues extends FieldValues> {
  schema: z.ZodType<TFieldValues>
  defaultValues: DefaultValues<TFieldValues>
  onSubmit: (data: TFieldValues) => void | Promise<void>
  children: ReactNode
}

export function Form<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: FormProps<TFieldValues>) {
  const methods = useForm<TFieldValues>({
    resolver: zodResolver(schema as never) as Resolver<TFieldValues>,
    defaultValues,
  })

  return (
    <FormProvider {...methods}>
      <FormSubmitContext.Provider value={() => { methods.handleSubmit(onSubmit)() }}>
        {children}
      </FormSubmitContext.Provider>
    </FormProvider>
  )
}

export function useFormSubmit(): () => void {
  const submit = useContext(FormSubmitContext)
  if (!submit) {
    throw new Error('useFormSubmit must be used within a Form')
  }

  return submit
}

export interface FormFieldRenderProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
}

export interface FormFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>
  children: (props: FormFieldRenderProps) => ReactElement
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  children,
}: FormFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => children({
        value: String(field.value ?? ''),
        onChange: field.onChange,
        onBlur: field.onBlur,
        error: fieldState.error?.message,
      })}
    />
  )
}
